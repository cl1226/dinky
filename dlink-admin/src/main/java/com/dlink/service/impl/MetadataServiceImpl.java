package com.dlink.service.impl;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.bean.copier.CopyOptions;
import cn.hutool.core.io.FileUtil;
import cn.hutool.json.JSONObject;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.dlink.assertion.Asserts;
import com.dlink.common.result.Result;
import com.dlink.context.RowLevelPermissionsContext;
import com.dlink.dto.AbstractStatementDTO;
import com.dlink.dto.StudioLineageDTO;
import com.dlink.explainer.lineage.LineageBuilder;
import com.dlink.explainer.lineage.LineageRelation;
import com.dlink.explainer.lineage.LineageResult;
import com.dlink.explainer.lineage.LineageTable;
import com.dlink.mapper.HadoopClusterMapper;
import com.dlink.minio.MinioStorageService;
import com.dlink.model.*;
import com.dlink.process.context.ProcessContextHolder;
import com.dlink.process.model.ProcessEntity;
import com.dlink.service.*;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.security.UserGroupInformation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * MetadataServiceImpl
 *
 * @author cl1226
 * @since 2023/6/15 14:14
 **/
@Slf4j
@Service
public class MetadataServiceImpl implements MetadataService {

    @Autowired
    private MetadataVolumeService metadataVolumeService;
    @Autowired
    private DataBaseService dataBaseService;
    @Autowired
    private TaskService taskService;
    @Autowired
    private FragmentVariableService fragmentVariableService;
    @Autowired
    private UserService userService;
    @Autowired
    private MetadataTableService metadataTableService;
    @Autowired
    private MetadataColumnService metadataColumnService;
    @Autowired
    private MetadataTableLineageService metadataTableLineageService;
    @Autowired
    private MetadataColumnLineageService metadataColumnLineageService;
    @Autowired
    private HadoopClusterMapper hadoopClusterMapper;
    @Autowired
    private MinioStorageService minioStorageService;
    @Value("${dinky.minio.bucket-name}")
    private String bucketName;

    @Override
    public Result statistics() {
        List<JSONObject> jsonObjects = new ArrayList<>();
        JSONObject jsonObject = new JSONObject();
        jsonObject.set("type", "technical");
        jsonObject.set("title", "技术元数据");

        QueryWrapper<MetadataVolume> queryWrapper = Wrappers.<MetadataVolume>query().eq("type", "ALL");
        List<MetadataVolume> metadataVolumes = metadataVolumeService.list(queryWrapper);
        int dbNum = 0;
        int tableNum = 0;
        BigDecimal dataVol = BigDecimal.ZERO;
        for (MetadataVolume volume : metadataVolumes) {
            dbNum += volume.getDbNum();
            tableNum += volume.getTableNum();
            dataVol = dataVol.add(volume.getDataVol());
        }

        jsonObject.set("dbNum", dbNum);
        jsonObject.set("tableNum", tableNum);
        jsonObject.set("dataVol", dataVol);
        jsonObject.set("dataUnit", "Byte");

        jsonObjects.add(jsonObject);
        return Result.succeed(jsonObjects, "获取成功!");
    }

    @Override
    public Result statisticsDetail() {
        QueryWrapper<MetadataVolume> queryWrapper = Wrappers.<MetadataVolume>query().eq("type", "DB");
        List<MetadataVolume> metadataVolumes = metadataVolumeService.list(queryWrapper);
        Map<String, List<MetadataVolume>> map = new HashMap<>();
        for (MetadataVolume volume : metadataVolumes) {
            if (map.containsKey(volume.getDatasourceType() + "__" + volume.getDatasourceName())) {
                List<MetadataVolume> dbs = map.get(volume.getDatasourceType() + "__" + volume.getDatasourceName());
                dbs.add(volume);
            } else {
                List<MetadataVolume> volumes = new ArrayList<>();
                volumes.add(volume);
                map.put(volume.getDatasourceType() + "__" + volume.getDatasourceName(), volumes);
            }
        }
        List<JSONObject> list = new ArrayList<>();
        for (Map.Entry entry : map.entrySet()) {
            JSONObject jsonObject = new JSONObject();
            String mapKey = (String) entry.getKey();
            List<MetadataVolume> mapValue = (List<MetadataVolume>) entry.getValue();
            jsonObject.set("datasourceType", mapKey.split("__")[0]);
            if (mapValue != null && mapValue.size() > 0) {
                jsonObject.set("datasourceId", mapValue.get(0).getDatasourceId());
                jsonObject.set("datasourceName", mapValue.get(0).getDatasourceName());
                int tableNum = 0;
                BigDecimal dataVol = BigDecimal.ZERO;
                for (MetadataVolume volume : mapValue) {
                    tableNum = tableNum + volume.getTableNum().intValue();
                    dataVol = dataVol.add(volume.getDataVol() == null ? BigDecimal.ZERO : volume.getDataVol());
                }
                jsonObject.set("tableNum", tableNum);
                jsonObject.set("dataVol", dataVol);
            } else {
                jsonObject.set("datasourceId", 0);
                jsonObject.set("datasourceName", "");
                jsonObject.set("tableNum", 0);
                jsonObject.set("dataVol", 0);
            }

            jsonObject.set("dbNum", mapValue.size());
            jsonObject.set("dbs", mapValue);
            list.add(jsonObject);
        }
        return Result.succeed(list, "获取成功");
    }

    private boolean initKerberos(DataBase dataBase) {
        HadoopCluster hadoopCluster = hadoopClusterMapper.getOneByAddress(dataBase.getUrl());
        if (hadoopCluster == null) {
            return false;
        }
        String krb5Path = "/hadoop/" + hadoopCluster.getUuid() + "/keytab/krb5.conf";
        String keytabPath =  "/hadoop/" + hadoopCluster.getUuid() + "/keytab/" + dataBase.getKeytabName();
        InputStream krb5in = minioStorageService.downloadFile(bucketName, krb5Path);
        InputStream keytabin = minioStorageService.downloadFile(bucketName, keytabPath);
        FileUtil.writeFromStream(krb5in, new File(krb5Path));
        FileUtil.writeFromStream(keytabin, new File(keytabPath));
        System.setProperty("java.security.krb5.conf", krb5Path);
        Configuration configuration = new Configuration();
        configuration.set("hadoop.security.authentication" , "Kerberos");
        configuration.setBoolean("hadoop.security.authorization", true);
        UserGroupInformation.setConfiguration(configuration);
        try {
            UserGroupInformation.loginUserFromKeytab(dataBase.getPrincipalName() , keytabPath);
        } catch (IOException e) {
            e.printStackTrace();
        }
        return true;
    }

    @Override
    public Result calcLineage(Integer taskId) {
        List<Task> tasks = taskService.list();
        for (Task t : tasks) {
            Task task = taskService.getTaskInfoById(t.getId());
            DataBase dataBase = dataBaseService.getById(task.getDatabaseId());
            if (dataBase == null || StringUtils.isBlank(task.getStatement())) {
                continue;
            }
            if (dataBase.getKerberos() != null && dataBase.getKerberos()) {
                initKerberos(dataBase);
            }
            log.info("开始解析任务【" + task.getName() + "】的血缘关系......");
            LineageResult lineage = new LineageResult();
            if (!task.getDialect().toLowerCase().equalsIgnoreCase("flinksql")) {
                if (task.getDialect().toLowerCase().equalsIgnoreCase("doris")
                || task.getDialect().toLowerCase().equalsIgnoreCase("starrocks")) {
                    lineage = com.dlink.explainer.sqllineage.LineageBuilder.getSqlLineage(task.getStatement(), "mysql",
                            dataBase.getDriverConfig());
                } else {
                    lineage = com.dlink.explainer.sqllineage.LineageBuilder.getSqlLineage(task.getStatement(),
                            task.getDialect().toLowerCase(), dataBase.getDriverConfig());
                }

            } else {
                StudioLineageDTO studioLineageDTO = new StudioLineageDTO();
                BeanUtil.copyProperties(task, studioLineageDTO, CopyOptions.create(null, true));
                addFlinkSQLEnv(studioLineageDTO);
                lineage = LineageBuilder.getColumnLineageByLogicalPlan(task.getStatement());
            }
            log.info("成功解析任务【" + task.getName() + "】的血缘关系。");
            if (lineage == null) {
                continue;
            }
            List<LineageTable> tables = lineage.getTables();
            List<LineageRelation> relations = lineage.getRelations();

            if (tables == null || tables.size() == 0) {
                continue;
            }
            log.info("开始记录血缘关系：" + task.getId() + "," + task.getName());
            Map<String, LineageTable> tableMap = new HashMap<>();
            for (LineageTable table : tables) {
                tableMap.put(table.getId(), table);
            }
            List<MetadataTableLineage> tableLineages = new ArrayList<>();
            List<String> srcTableIds = new ArrayList<>();
            List<String> targetTableIds = new ArrayList<>();
            for (LineageRelation relation : relations) {
                if (srcTableIds.contains(relation.getSrcTableId()) && targetTableIds.contains(relation.getTgtTableId())) {
                    continue;
                }
                srcTableIds.add(relation.getSrcTableId());
                targetTableIds.add(relation.getTgtTableId());
                LineageTable srcTable = tableMap.get(relation.getSrcTableId());
                LineageTable tgtTable = tableMap.get(relation.getTgtTableId());
                MetadataTableLineage metadataTableLineage = buildMetadataTableLineage(dataBase, srcTable, tgtTable);
                tableLineages.add(metadataTableLineage);
            }
            List<MetadataColumnLineage> columnLineages = new ArrayList<>();
            for (LineageRelation relation : relations) {
                String srcColName = relation.getSrcTableColName();
                String tgtColName = relation.getTgtTableColName();
                LineageTable srcTable = tableMap.get(relation.getSrcTableId());
                LineageTable tgtTable = tableMap.get(relation.getTgtTableId());
                MetadataColumnLineage metadataColumnLineage = buildMetadataColumnLineage(dataBase, srcColName, tgtColName, srcTable, tgtTable);
                columnLineages.add(metadataColumnLineage);
            }

            this.saveOrUpdateBatchMetadataTableLineage(dataBase.getId(), tableLineages);
            this.saveOrUpdateBatchMetadataColumnLineage(dataBase.getId(), columnLineages);

            log.info("成功记录血缘关系：" + task.getId() + "," + task.getName());
        }

        return Result.succeed("血缘记录成功");
    }

    private void saveOrUpdateBatchMetadataTableLineage(Integer datasourceId, List<MetadataTableLineage> tableLineages) {
        LambdaQueryWrapper<MetadataTableLineage> wrapper = Wrappers.<MetadataTableLineage>lambdaQuery().eq(MetadataTableLineage::getOriginDatasourceId, datasourceId);
        wrapper.and(wp -> wp.eq(MetadataTableLineage::getOriginTableId, tableLineages.get(0).getOriginTableId()).eq(MetadataTableLineage::getTargetTableId, tableLineages.get(0).getTargetTableId()));
        if (tableLineages.size() > 1) {
            for (int i = 1; i < tableLineages.size(); i++) {
                int finalI = i;
                wrapper.or(wp -> wp.eq(MetadataTableLineage::getOriginTableId, tableLineages.get(finalI).getOriginTableId()).eq(MetadataTableLineage::getTargetTableId, tableLineages.get(finalI).getTargetTableId()));
            }
        }
        List<MetadataTableLineage> updates = new ArrayList<>();
        List<MetadataTableLineage> adds = new ArrayList<>();
        List<MetadataTableLineage> oldTableLineages = metadataTableLineageService.list(wrapper);
        for (MetadataTableLineage newLineage : tableLineages) {
            boolean newExists = false;
            for (MetadataTableLineage oldLineage : oldTableLineages) {
                if (newLineage.getOriginTableId().intValue() == oldLineage.getOriginTableId().intValue()
                && newLineage.getTargetTableId().intValue() == newLineage.getTargetTableId().intValue()) {
                    BeanUtil.copyProperties(newLineage, oldLineage, CopyOptions.create(null, true));
                    updates.add(oldLineage);
                    newExists = true;
                    break;
                }
            }
            if (!newExists) {
                adds.add(newLineage);
            }
        }
        metadataTableLineageService.saveOrUpdateBatch(adds);
        metadataTableLineageService.saveOrUpdateBatch(updates);
    }

    private void saveOrUpdateBatchMetadataColumnLineage(Integer datasourceId, List<MetadataColumnLineage> columnLineages) {
        LambdaQueryWrapper<MetadataColumnLineage> wrapper = Wrappers.<MetadataColumnLineage>lambdaQuery().eq(MetadataColumnLineage::getOriginDatasourceId, datasourceId);
        wrapper.and(wp -> wp.eq(MetadataColumnLineage::getOriginTableId, columnLineages.get(0).getOriginTableId())
                .eq(MetadataColumnLineage::getOriginColumnId, columnLineages.get(0).getOriginColumnId())
                .eq(MetadataColumnLineage::getTargetTableId, columnLineages.get(0).getTargetTableId())
                .eq(MetadataColumnLineage::getTargetColumnId, columnLineages.get(0).getTargetColumnId()));
        if (columnLineages.size() > 1) {
            for (int i = 1; i < columnLineages.size(); i++) {
                int finalI = i;
                wrapper.or(wp -> wp.eq(MetadataColumnLineage::getOriginTableId, columnLineages.get(finalI).getOriginTableId())
                        .eq(MetadataColumnLineage::getOriginColumnId, columnLineages.get(finalI).getOriginColumnId())
                        .eq(MetadataColumnLineage::getTargetTableId, columnLineages.get(finalI).getTargetTableId())
                        .eq(MetadataColumnLineage::getTargetColumnId, columnLineages.get(finalI).getTargetColumnId()));
            }
        }
        List<MetadataColumnLineage> updates = new ArrayList<>();
        List<MetadataColumnLineage> adds = new ArrayList<>();
        List<MetadataColumnLineage> oldColumnLineages = metadataColumnLineageService.list(wrapper);
        for (MetadataColumnLineage newLineage : columnLineages) {
            boolean newExists = false;
            for (MetadataColumnLineage oldLineage : oldColumnLineages) {
                if (newLineage.getOriginTableId().intValue() == oldLineage.getOriginTableId().intValue()
                        && newLineage.getOriginColumnId().intValue() == oldLineage.getOriginColumnId().intValue()
                        && newLineage.getTargetTableId().intValue() == oldLineage.getTargetTableId().intValue()
                        && newLineage.getTargetColumnId().intValue() == oldLineage.getTargetColumnId().intValue()) {
                    BeanUtil.copyProperties(newLineage, oldLineage, CopyOptions.create(null, true));
                    updates.add(oldLineage);
                    newExists = true;
                    break;
                }
            }
            if (!newExists) {
                adds.add(newLineage);
            }
        }
        metadataColumnLineageService.saveOrUpdateBatch(adds);
        metadataColumnLineageService.saveOrUpdateBatch(updates);
    }

    // 计算表血缘关系
    private MetadataTableLineage buildMetadataTableLineage(DataBase dataBase, LineageTable srcTable, LineageTable tgtTable) {
        // 源
        String tableName = srcTable.getName();
        String[] split = tableName.split("\\.");
        MetadataTableLineage metadataTableLineage = new MetadataTableLineage();
        metadataTableLineage.setOriginDatasourceId(dataBase.getId());
        metadataTableLineage.setOriginDatasourceName(split[0].toLowerCase(Locale.ROOT));
        metadataTableLineage.setOriginDatasourceType(StringUtils.capitalize(dataBase.getType().toLowerCase(Locale.ROOT)));
        metadataTableLineage.setOriginTableName(split[1].toLowerCase(Locale.ROOT));
        // 查询表元数据
        QueryWrapper<MetadataTable> wrapper = Wrappers.<MetadataTable>query().eq("datasource_id", dataBase.getId());
        wrapper.eq("db_name", split[0].toLowerCase(Locale.ROOT));
        wrapper.eq("name", split[1].toLowerCase(Locale.ROOT));
        MetadataTable metadataTable = metadataTableService.getOne(wrapper);
        metadataTableLineage.setOriginTableId(metadataTable.getId());
        metadataTableLineage.setOriginDbId(metadataTable.getDbId());
        metadataTableLineage.setOriginDbName(metadataTable.getDbName());

        // 目标
        String tgtTableName = tgtTable.getName();
        String[] tgtSplit = tgtTableName.split("\\.");
        metadataTableLineage.setTargetDatasourceId(dataBase.getId());
        metadataTableLineage.setTargetDatasourceName(tgtSplit[0].toLowerCase(Locale.ROOT));
        metadataTableLineage.setTargetDatasourceType(StringUtils.capitalize(dataBase.getType().toLowerCase(Locale.ROOT)));
        metadataTableLineage.setTargetTableName(tgtSplit[1].toLowerCase(Locale.ROOT));
        // 查询表元数据
        QueryWrapper<MetadataTable> tgtWrapper = Wrappers.<MetadataTable>query().eq("datasource_id", dataBase.getId());
        tgtWrapper.eq("db_name", tgtSplit[0].toLowerCase(Locale.ROOT));
        tgtWrapper.eq("name", tgtSplit[1].toLowerCase(Locale.ROOT));
        MetadataTable tgtMetadataTable = metadataTableService.getOne(tgtWrapper);
        metadataTableLineage.setTargetTableId(tgtMetadataTable.getId());
        metadataTableLineage.setTargetDbId(tgtMetadataTable.getDbId());
        metadataTableLineage.setTargetDbName(tgtMetadataTable.getDbName());

        return metadataTableLineage;
    }

    // 计算字段血缘关系
    private MetadataColumnLineage buildMetadataColumnLineage(DataBase dataBase, String srcColName, String tgtColName, LineageTable srcTable, LineageTable tgtTable) {
        // 源
        String tableName = srcTable.getName();
        String[] split = tableName.split("\\.");
        MetadataColumnLineage metadataColumnLineage = new MetadataColumnLineage();
        metadataColumnLineage.setOriginDatasourceId(dataBase.getId());
        metadataColumnLineage.setOriginDatasourceName(split[0].toLowerCase(Locale.ROOT));
        metadataColumnLineage.setOriginDatasourceType(StringUtils.capitalize(dataBase.getType().toLowerCase(Locale.ROOT)));
        // 查询表元数据
        QueryWrapper<MetadataTable> wrapper = Wrappers.<MetadataTable>query().eq("datasource_id", dataBase.getId());
        wrapper.eq("db_name", split[0].toLowerCase(Locale.ROOT));
        wrapper.eq("name", split[1].toLowerCase(Locale.ROOT));
        MetadataTable metadataTable = metadataTableService.getOne(wrapper);
        metadataColumnLineage.setOriginDbId(metadataTable.getDbId());
        metadataColumnLineage.setOriginDbName(metadataTable.getDbName());
        metadataColumnLineage.setOriginTableId(metadataTable.getId());
        metadataColumnLineage.setOriginTableName(split[1].toLowerCase(Locale.ROOT));
        // 查询字段元数据
        QueryWrapper<MetadataColumn> wrapper2 = Wrappers.<MetadataColumn>query().eq("datasource_id", dataBase.getId());
        wrapper2.eq("db_name", split[0].toLowerCase(Locale.ROOT));
        wrapper2.eq("name", srcColName);
        wrapper2.eq("table_name", split[1].toLowerCase(Locale.ROOT));
        MetadataColumn metadataColumn = metadataColumnService.getOne(wrapper2);
        metadataColumnLineage.setOriginColumnId(metadataColumn.getId());
        metadataColumnLineage.setOriginColumnName(metadataColumn.getName());

        // 目标
        String tgtTableName = tgtTable.getName();
        String[] tgtSplit = tgtTableName.split("\\.");
        metadataColumnLineage.setTargetDatasourceId(dataBase.getId());
        metadataColumnLineage.setTargetDatasourceName(tgtSplit[0].toLowerCase(Locale.ROOT));
        metadataColumnLineage.setTargetDatasourceType(StringUtils.capitalize(dataBase.getType().toLowerCase(Locale.ROOT)));
        // 查询表元数据
        QueryWrapper<MetadataTable> tgtWrapper = Wrappers.<MetadataTable>query().eq("datasource_id", dataBase.getId());
        tgtWrapper.eq("db_name", tgtSplit[0].toLowerCase(Locale.ROOT));
        tgtWrapper.eq("name", tgtSplit[1].toLowerCase(Locale.ROOT));
        MetadataTable tgtMetadataTable = metadataTableService.getOne(tgtWrapper);
        metadataColumnLineage.setTargetTableId(tgtMetadataTable.getId());
        metadataColumnLineage.setTargetTableName(tgtSplit[1].toLowerCase(Locale.ROOT));
        metadataColumnLineage.setTargetDbId(tgtMetadataTable.getDbId());
        metadataColumnLineage.setTargetDbName(tgtMetadataTable.getDbName());
        // 查询字段元数据
        QueryWrapper<MetadataColumn> tgtWrapper2 = Wrappers.<MetadataColumn>query().eq("datasource_id", dataBase.getId());
        tgtWrapper2.eq("db_name", tgtSplit[0].toLowerCase(Locale.ROOT));
        tgtWrapper2.eq("name", srcColName);
        tgtWrapper2.eq("table_name", tgtSplit[1].toLowerCase(Locale.ROOT));
        MetadataColumn tgtMetadataColumn = metadataColumnService.getOne(tgtWrapper2);
        metadataColumnLineage.setTargetColumnId(tgtMetadataColumn.getId());
        metadataColumnLineage.setTargetColumnName(tgtMetadataColumn.getName());

        return metadataColumnLineage;
    }

    private void addFlinkSQLEnv(AbstractStatementDTO statementDTO) {
        ProcessEntity process = ProcessContextHolder.getProcess();
        process.info("Start initialize FlinkSQLEnv:");
        if (statementDTO.isFragment()) {
            process.config("Variable opened.");

            // initialize global variables
            process.info("Initializing global variables...");
            statementDTO.setVariables(fragmentVariableService.listEnabledVariables());
            process.infoSuccess();

            // initialize database variables
            process.info("Initializing database variables...");
            String flinkWithSql = dataBaseService.getEnabledFlinkWithSql();
            if (Asserts.isNotNullString(flinkWithSql)) {
                statementDTO.setStatement(flinkWithSql + "\n" + statementDTO.getStatement());
                process.infoSuccess();
            } else {
                process.info("No variables are loaded.");
            }
        }

        // initialize flinksql environment, such as flink catalog
        if (Asserts.isNotNull(statementDTO.getEnvId()) && !statementDTO.getEnvId().equals(0)) {
            process.config("FlinkSQLEnv opened.");
            process.info("Initializing FlinkSQLEnv...");
            Task task = taskService.getTaskInfoById(statementDTO.getEnvId());
            if (Asserts.isNotNull(task) && Asserts.isNotNullString(task.getStatement())) {
                statementDTO.setStatement(task.getStatement() + "\n" + statementDTO.getStatement());
                process.infoSuccess();
            } else {
                process.info("No FlinkSQLEnv are loaded.");
            }
        }

        process.info("Initializing data permissions...");
        List<RoleSelectPermissions> currentRoleSelectPermissions = userService.getCurrentRoleSelectPermissions();
        if (Asserts.isNotNullCollection(currentRoleSelectPermissions)) {
            ConcurrentHashMap<String, String> permission = new ConcurrentHashMap<>();
            for (RoleSelectPermissions roleSelectPermissions : currentRoleSelectPermissions) {
                if (Asserts.isAllNotNullString(roleSelectPermissions.getTableName(),
                        roleSelectPermissions.getExpression())) {
                    permission.put(roleSelectPermissions.getTableName(), roleSelectPermissions.getExpression());
                }
            }
            RowLevelPermissionsContext.set(permission);
        }
        process.info("Finish initialize FlinkSQLEnv.");
    }
}
