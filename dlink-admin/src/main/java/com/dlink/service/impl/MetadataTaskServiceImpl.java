package com.dlink.service.impl;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.bean.copier.CopyOptions;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dlink.common.result.Result;
import com.dlink.db.service.impl.SuperServiceImpl;
import com.dlink.dto.SearchCondition;
import com.dlink.mapper.MetadataTaskMapper;
import com.dlink.metadata.driver.Driver;
import com.dlink.metadata.result.JdbcSelectResult;
import com.dlink.model.*;
import com.dlink.service.*;
import com.dlink.utils.QuartzUtil;
import com.dlink.utils.ShellUtil;
import org.apache.commons.lang3.StringUtils;
import org.quartz.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.text.ParseException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;

/**
 * MetadataTaskServiceImpl
 *
 * @author cl1226
 * @since 2023/6/9 13:36
 **/
@Service
public class MetadataTaskServiceImpl extends SuperServiceImpl<MetadataTaskMapper, MetadataTask> implements MetadataTaskService {

    @Autowired
    private DataBaseService dataBaseService;
    @Autowired
    private MetadataDbService metadataDbService;
    @Autowired
    private MetadataTableService metadataTableService;
    @Autowired
    private MetadataColumnService metadataColumnService;
    @Autowired
    private MetadataTaskInstanceService metadataTaskInstanceService;
    @Autowired
    private Scheduler scheduler;
    @Autowired
    private EnvironmentInstanceService environmentInstanceService;
    @Autowired
    private MetadataVolumeService metadataVolumeService;

    @Override
    public Page<MetadataTask> page(SearchCondition searchCondition) {
        Page<MetadataTask> page = new Page<>(searchCondition.getPageIndex(), searchCondition.getPageSize());

        QueryWrapper<MetadataTask> queryWrapper = new QueryWrapper<MetadataTask>();
        if (StringUtils.isNotBlank(searchCondition.getName())) {
            queryWrapper.eq("name", searchCondition.getName());
        }
        if (searchCondition.getCatalogueId() != null) {
            queryWrapper.eq("catalogue_id", searchCondition.getCatalogueId());
        }

        queryWrapper.orderByDesc("create_time");

        return this.baseMapper.selectPage(page, queryWrapper);
    }

    @Override
    public Result online(Integer id) {
        MetadataTask metadataTask = this.getById(id);
        if (metadataTask == null) {
            return Result.failed("任务不存在!");
        }
        if (metadataTask.getStatus().intValue() == 1) {
            return Result.failed("任务已上线!");
        }
        metadataTask.setStatus(1);

        if ("CYCLE".equals(metadataTask.getScheduleType()) && StringUtils.isNotBlank(metadataTask.getCronExpression())) {
            Map<String, Integer> map = new HashMap<>();
            try {
                this.addJob(QuartzUtil.class,
                        metadataTask.getName() + "_元数据采集任务",
                        "MetaDataJob",
                        metadataTask.getCronExpression(),
                        map,
                        null);
                CronExpression cronExpression = new CronExpression(metadataTask.getCronExpression());
                Date nextValidTimeAfter = cronExpression.getNextValidTimeAfter(new Date());
                metadataTask.setScheduleStatus("Success");
                metadataTask.setNextRunTime(LocalDateTime.ofInstant(Instant.ofEpochMilli(nextValidTimeAfter.getTime()), ZoneId.systemDefault()));
                this.updateById(metadataTask);
            } catch (SchedulerException | ParseException e) {
                metadataTask.setScheduleStatus("Failed");
                this.updateById(metadataTask);
                e.printStackTrace();
            }
        } else {
            this.updateById(metadataTask);
        }
        return Result.succeed(metadataTask, "任务上线成功");
    }

    @Override
    public Result offline(Integer id) {
        MetadataTask metadataTask = this.getById(id);
        if (metadataTask == null) {
            return Result.failed("任务不存在!");
        }
        if (metadataTask.getStatus().intValue() == 0) {
            return Result.failed("任务已下线!");
        }
        metadataTask.setStatus(0);

        if (metadataTask.getScheduleType().equals("CYCLE")) {
            this.deleteJob(metadataTask.getName() + "_元数据采集任务",
                    "MetaDataJob");
            metadataTask.setNextRunTime(null);
            metadataTask.setScheduleStatus(null);
        }
        this.updateById(metadataTask);

        return Result.succeed(metadataTask, "任务下线成功");
    }

    public void addJob(Class<? extends Job> jobClass, String jobName, String jobGroupName, String cron, Map jobData, Date endTime)
            throws SchedulerException {
        JobDetail jobDetail = JobBuilder.newJob(jobClass).withIdentity(jobName, jobGroupName).build();
        if (jobData != null && jobData.size() > 0) {
            jobDetail.getJobDataMap().putAll(jobData);
        }
        Trigger trigger = TriggerBuilder.newTrigger().withIdentity(jobName, jobGroupName)
                .startAt(DateBuilder.futureDate(1, DateBuilder.IntervalUnit.SECOND))
                .withSchedule(CronScheduleBuilder.cronSchedule(cron)).build();
        if(endTime != null){
            trigger.getTriggerBuilder().endAt(endTime);
        }
        scheduler.scheduleJob(jobDetail, trigger);
    }

    public Trigger getTrigger(String jobName, String jobGroupName) throws SchedulerException {
        return scheduler.getTrigger(TriggerKey.triggerKey(jobName, jobGroupName));
    }

    /**
     * 删除任务一个job
     */
    public void deleteJob(String jobName, String jobGroupName) {
        try {
            scheduler.deleteJob(JobKey.jobKey(jobName, jobGroupName));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public Result statisticsMetadata() {
        QueryWrapper<MetadataVolume> wrapper = Wrappers.<MetadataVolume>query().eq("type", "ALL");
        wrapper.orderByDesc("db_num + table_num");
        wrapper.last("limit 5");
        List<MetadataVolume> list = metadataVolumeService.list(wrapper);
        return Result.succeed(list, "获取成功");
    }

    @Override
    public Result statisticsTaskInstance() {
        QueryWrapper<MetadataTaskInstance> wrapper = Wrappers.<MetadataTaskInstance>query().groupBy("status");
        wrapper.select("status", "count(1) num");
        List<Map<String, Object>> list = metadataTaskInstanceService.getBaseMapper().selectMaps(wrapper);
        return Result.succeed(list, "获取成功");
    }

    @Override
    public Result execute(Integer id) {
        MetadataTask task = this.getById(id);
        if (task == null) {
            return Result.failed("任务不存在!");
        }
        DataBase dataBase = dataBaseService.getById(task.getDatasourceId());
        if (dataBase == null) {
            return Result.failed("数据源不存在!");
        }
        task.setRunStatus("Running");
        if ("CYCLE".equals(task.getScheduleType()) && StringUtils.isNotBlank(task.getCronExpression())) {
            CronExpression cronExpression = null;
            try {
                cronExpression = new CronExpression(task.getCronExpression());
                Date nextValidTimeAfter = cronExpression.getNextValidTimeAfter(new Date());
                task.setNextRunTime(LocalDateTime.ofInstant(Instant.ofEpochMilli(nextValidTimeAfter.getTime()), ZoneId.systemDefault()));
                task.setScheduleStatus("Success");
                this.saveOrUpdate(task);
            } catch (ParseException e) {
                e.printStackTrace();
            }
        } else {
            this.saveOrUpdate(task);
        }
        long beginTime = System.currentTimeMillis();
        MetadataTaskInstance metadataTaskInstance = new MetadataTaskInstance();
        metadataTaskInstance.setTaskId(task.getId());
        metadataTaskInstance.setStatus("Running");
        metadataTaskInstance.setCronExpression(task.getCronExpression());
        metadataTaskInstance.setBeginTime(LocalDateTime.now());
        metadataTaskInstance.setCatalogueId(task.getCatalogueId());
        metadataTaskInstance.setScheduleType(task.getScheduleType());
        metadataTaskInstance.setDatasourceId(task.getDatasourceId());
        metadataTaskInstance.setDatasourceName(task.getDatasourceName());
        metadataTaskInstance.setDatasourceType(task.getDatasourceType());
        metadataTaskInstance.setName(task.getName());
        metadataTaskInstanceService.saveOrUpdate(metadataTaskInstance);
        List<MetadataDb> dbs = new ArrayList<>();
        List<MetadataTable> tbls = new ArrayList<>();
        List<MetadataColumn> cols = new ArrayList<>();
        try {
            List<Schema> schemasAndTables = dataBaseService.getSchemasAndTablesV2(task.getDatasourceId());

            if (schemasAndTables != null && schemasAndTables.size() > 0) {
                for (Schema schema : schemasAndTables) {
                    MetadataDb metadataDb = new MetadataDb();
                    metadataDb.setName(schema.getName());
                    if (task.getDatasourceType().equals("Hive")) {
                        JSONObject jsonObject = dataBaseService.showDatabase(task.getDatasourceId(), schema.getName());
                        metadataDb.setAttributes(jsonObject.toString());
                    } else {
                        metadataDb.setAttributes(schema.getAttributes());
                    }
                    metadataDb.setDatasourceId(task.getDatasourceId());
                    metadataDb.setDatasourceType(task.getDatasourceType());
                    metadataDb.setDatasourceName(dataBase.getName());
                    dbs.add(metadataDb);
                    for (Table table : schema.getTables()) {
                        if (task.getDatasourceType().equals("Hive")) {
                            Map<String, Object> map = dataBaseService.showFormattedTable(task.getDatasourceId(), schema.getName(), table.getName());
                            if (map != null) {
                                List<Column> columns = (List<Column>) map.get("columns");
                                Map<String, String> detailTableInfo = (Map<String, String>) map.get("detailTableInfo");
                                MetadataTable metadataTable = new MetadataTable();
                                metadataTable.setName(table.getName());
                                metadataTable.setDatasourceName(dataBase.getName());
                                metadataTable.setDatasourceType(task.getDatasourceType());
                                metadataTable.setDatasourceId(task.getDatasourceId());
                                metadataTable.setDbName(metadataDb.getName());
                                metadataTable.setAttributes(JSONUtil.toJsonStr(detailTableInfo));
                                metadataTable.setPosition(task.getDatasourceId() + "_" + metadataDb.getName());
                                tbls.add(metadataTable);

                                for (Column column : columns) {
                                    MetadataColumn metadataColumn = new MetadataColumn();
                                    metadataColumn.setName(column.getName());
                                    metadataColumn.setColumnType(column.getType());
                                    metadataColumn.setDescription(column.getComment());
                                    metadataColumn.setDatasourceType(task.getDatasourceType());
                                    metadataColumn.setDatasourceId(dataBase.getId());
                                    metadataColumn.setDatasourceName(dataBase.getName());
                                    metadataColumn.setDbName(metadataDb.getName());
                                    metadataColumn.setTableName(table.getName());
                                    metadataColumn.setPartitionFlag(column.isPartition());
                                    metadataColumn.setPosition(task.getDatasourceId() + "_" + metadataDb.getName() + "_" + metadataTable.getName());
                                    cols.add(metadataColumn);
                                }
                            }
                        } else {
                            List<Column> columns = dataBaseService.listColumns(task.getDatasourceId(), schema.getName(), table.getName());
                            MetadataTable metadataTable = new MetadataTable();
                            metadataTable.setName(table.getName());
                            metadataTable.setDatasourceName(dataBase.getName());
                            metadataTable.setDatasourceType(task.getDatasourceType());
                            metadataTable.setDatasourceId(task.getDatasourceId());
                            metadataTable.setDbName(metadataDb.getName());
                            metadataTable.setPosition(task.getDatasourceId() + "_" + metadataDb.getName());
                            tbls.add(metadataTable);
                            if (columns != null && columns.size() > 0) {
                                for (Column column : columns) {
                                    MetadataColumn metadataColumn = new MetadataColumn();
                                    BeanUtil.copyProperties(column, metadataColumn, CopyOptions.create(null, true));
                                    metadataColumn.setColumnType(column.getType());
                                    metadataColumn.setDescription(column.getComment());
                                    metadataColumn.setDatasourceType(task.getDatasourceType());
                                    metadataColumn.setDatasourceId(dataBase.getId());
                                    metadataColumn.setDatasourceName(dataBase.getName());
                                    metadataColumn.setDbName(metadataDb.getName());
                                    metadataColumn.setTableName(table.getName());
                                    metadataColumn.setPrecisionLength(column.getPrecision());
                                    metadataColumn.setCollationStr(column.getCollation());
                                    metadataColumn.setPosition(task.getDatasourceId() + "_" + metadataDb.getName() + "_" + metadataTable.getName());
                                    cols.add(metadataColumn);
                                }
                            }
                        }
                    }
                }
                this.saveOrUpdateMetadataDb(task, dbs, tbls, cols);
            }

            long duration = System.currentTimeMillis() - beginTime;
            metadataTaskInstance.setDuration(duration);
            metadataTaskInstance.setEndTime(LocalDateTime.now());
            metadataTaskInstance.setStatus("Success");
            metadataTaskInstanceService.saveOrUpdate(metadataTaskInstance);
            task.setRunStatus("Success");
            this.saveOrUpdate(task);
            this.statistics(task, dataBase, dbs, tbls);
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - beginTime;
            metadataTaskInstance.setDuration(duration);
            metadataTaskInstance.setStatus("Failed");
            metadataTaskInstance.setEndTime(LocalDateTime.now());
            metadataTaskInstanceService.saveOrUpdate(metadataTaskInstance);
            task.setRunStatus("Failed");
            this.saveOrUpdate(task);
            e.printStackTrace();
        }
        return Result.succeed("采集成功");
    }

    private void statistics(MetadataTask task, DataBase dataBase, List<MetadataDb> dbs, List<MetadataTable> tbls) throws Exception {
        // 统计整体数据量
        QueryWrapper<MetadataVolume> wrapper = Wrappers.<MetadataVolume>query().eq("datasource_id", task.getDatasourceId());
        wrapper.eq("type", "ALL");
        MetadataVolume origin = metadataVolumeService.getOne(wrapper);
        if (origin == null) {
            origin = new MetadataVolume();
        }
        origin.setDatasourceType(task.getDatasourceType());
        origin.setDatasourceName(dataBase.getName());
        origin.setDatasourceId(dataBase.getId());
        origin.setDbNum(dbs.size());
        origin.setTableNum(tbls.size());
        origin.setName(dataBase.getName());
        origin.setDataUnit("Byte");
        origin.setType("ALL");
        BigDecimal totalHiveVol = BigDecimal.ZERO;
        // 统计数据量
        if (task.getDatasourceType().equals("Hive")) {
            String url = dataBase.getDriverConfig().getUrl();
            String[] split = url.split("/|:");
            String ip = split[4];
            QueryWrapper<EnvironmentInstance> queryWrapper = Wrappers.<EnvironmentInstance>query().eq("ip", ip);
            queryWrapper.or().eq("host_name", ip);
            EnvironmentInstance environmentInstance = environmentInstanceService.getOne(queryWrapper);
            String res = "0";
            if (environmentInstance != null) {
                ShellUtil instance = ShellUtil.getInstance();
                instance.init(environmentInstance.getIp(), environmentInstance.getPort(), environmentInstance.getUsername(), environmentInstance.getPassword());
                res = instance.execCmd("hadoop fs -du -v /user/hive/warehouse |awk '{ SUM += $1 } END { print SUM}'");
            }
            totalHiveVol = BigDecimal.valueOf(Double.valueOf(res));
            origin.setDataVol(BigDecimal.valueOf(Double.valueOf(res)));
        } else {
            Driver driver = Driver.build(dataBase.getDriverConfig());
            String sql = "";
            if (task.getDatasourceType().equals("SQLServer")) {
                sql = "SELECT\n" +
                        "    SUM(a.total_pages) * 8 * 1024 as dataVol\n" +
                        "FROM\n" +
                        "    sys.tables t\n" +
                        "INNER JOIN\n" +
                        "    sys.indexes i ON t.OBJECT_ID = i.object_id\n" +
                        "INNER JOIN\n" +
                        "    sys.partitions p ON i.object_id = p.OBJECT_ID AND i.index_id = p.index_id\n" +
                        "INNER JOIN\n" +
                        "    sys.allocation_units a ON p.partition_id = a.container_id\n" +
                        "WHERE t.NAME NOT LIKE 'dt%' AND t.is_ms_shipped = 0 AND i.OBJECT_ID > 255";
            } else {
                sql = "SELECT sum(data_length) as 'dataVol' FROM information_schema.TABLES";
            }
            JdbcSelectResult query = driver.query(sql, null);
            Object dataVol = null;
            if (query.getRowData() != null && query.getRowData().size() > 0) {
                dataVol = query.getRowData().get(0).get("dataVol");
            }
            if (dataVol != null) {
                origin.setDataVol(BigDecimal.valueOf(Double.valueOf(String.valueOf(dataVol))));
            }
        }
        metadataVolumeService.saveOrUpdate(origin);
        BigDecimal otherHiveVol = BigDecimal.ZERO;
        // 统计每个库的数据量
        for (MetadataDb db : dbs) {
            if (task.getDatasourceType().equals("Hive") && db.getName().equals("default")) {
                continue;
            }
            QueryWrapper<MetadataVolume> queryWrapper = Wrappers.<MetadataVolume>query().eq("datasource_id", task.getDatasourceId());
            queryWrapper.eq("type", "DB");
            queryWrapper.eq("name", db.getName());
            MetadataVolume volume = metadataVolumeService.getOne(queryWrapper);
            if (volume == null) {
                volume = new MetadataVolume();
            }
            int tableNum = 0;
            for (MetadataTable table : tbls) {
                if (table.getDatasourceId().equals(db.getDatasourceId()) && table.getDbName().equals(db.getName())) {
                    tableNum++;
                }
            }
            volume.setDatasourceType(task.getDatasourceType());
            volume.setDatasourceName(dataBase.getName());
            volume.setDatasourceId(dataBase.getId());
            volume.setDbNum(1);
            volume.setTableNum(tableNum);
            volume.setName(db.getName());
            volume.setDataUnit("Byte");
            volume.setType("DB");
            if (task.getDatasourceType().equals("Hive")) {
                String dbName = "";
                if (!db.getName().equals("default")) {
                    dbName = db.getName() + ".db";
                }

                String url = dataBase.getDriverConfig().getUrl();
                String[] split = url.split("/|:");
                String ip = split[4];
                QueryWrapper<EnvironmentInstance> q = Wrappers.<EnvironmentInstance>query().eq("ip", ip);
                q.or().eq("host_name", ip);
                EnvironmentInstance environmentInstance = environmentInstanceService.getOne(q);
                String r = "0";
                if (environmentInstance != null) {
                    ShellUtil instance = ShellUtil.getInstance();
                    instance.init(environmentInstance.getIp(), environmentInstance.getPort(), environmentInstance.getUsername(), environmentInstance.getPassword());
                    String str = "hadoop fs -du -v /user/hive/warehouse/" + dbName + " |awk '{ SUM += $1 } END { print SUM}'";
                    r = instance.execCmd(str);
                    otherHiveVol = otherHiveVol.add(BigDecimal.valueOf(Double.valueOf(r)));
                    volume.setDataVol(BigDecimal.valueOf(Double.valueOf(r)));
                }
            } else {
                Driver driver = Driver.build(dataBase.getDriverConfig());
                String sql = "";
                if (task.getDatasourceType().equals("SQLServer")) {
                    sql = "SELECT\n" +
                            "    SUM(a.total_pages) * 8 * 1024 as dataVol\n" +
                            "FROM\n" +
                            "    sys.tables t\n" +
                            "INNER JOIN\n" +
                            "    sys.indexes i ON t.OBJECT_ID = i.object_id\n" +
                            "INNER JOIN\n" +
                            "    sys.partitions p ON i.object_id = p.OBJECT_ID AND i.index_id = p.index_id\n" +
                            "INNER JOIN\n" +
                            "    sys.allocation_units a ON p.partition_id = a.container_id\n" +
                            "WHERE t.NAME NOT LIKE 'dt%' AND t.is_ms_shipped = 0 AND i.OBJECT_ID > 255";
                } else {
                    sql = "SELECT sum(data_length) as 'dataVol' FROM information_schema.TABLES WHERE table_schema='" + db.getName() + "' ";
                }
                JdbcSelectResult query = driver.query(sql, null);
                Object dataVol = query.getRowData().get(0).get("dataVol");
                if (dataVol != null) {
                    volume.setDataVol(BigDecimal.valueOf(Double.valueOf(String.valueOf(dataVol))));
                }
            }
            metadataVolumeService.saveOrUpdate(volume);
        }
        for (MetadataDb db : dbs) {
            if (task.getDatasourceType().equals("Hive") && db.getName().equals("default")) {
                QueryWrapper<MetadataVolume> queryWrapper = Wrappers.<MetadataVolume>query().eq("datasource_id", task.getDatasourceId());
                queryWrapper.eq("type", "DB");
                queryWrapper.eq("name", db.getName());
                MetadataVolume volume = metadataVolumeService.getOne(queryWrapper);
                if (volume == null) {
                    volume = new MetadataVolume();
                }
                int tableNum = 0;
                for (MetadataTable table : tbls) {
                    if (table.getDatasourceId().equals(db.getDatasourceId()) && table.getDbName().equals(db.getName())) {
                        tableNum++;
                    }
                }
                volume.setDatasourceType(task.getDatasourceType());
                volume.setDatasourceName(dataBase.getName());
                volume.setDatasourceId(dataBase.getId());
                volume.setDbNum(1);
                volume.setTableNum(tableNum);
                volume.setName(db.getName());
                volume.setDataUnit("Byte");
                volume.setType("DB");
                BigDecimal subtract = totalHiveVol.subtract(otherHiveVol);
                volume.setDataVol(subtract);
                metadataVolumeService.saveOrUpdate(volume);
                break;
            }
        }
    }

    private void saveOrUpdateMetadataDb(MetadataTask task, List<MetadataDb> dbs, List<MetadataTable> tbls, List<MetadataColumn> cols) {
        List<MetadataDb> oldMetadataDb = metadataDbService.list(Wrappers.<MetadataDb>query().eq("datasource_id", task.getDatasourceId()));
        List<MetadataDb> updates = new ArrayList<>();
        List<MetadataDb> removes = new ArrayList<>();
        List<MetadataDb> adds = new ArrayList<>();
        for (MetadataDb oldDb : oldMetadataDb) {
            boolean oldExists = false;
            for (MetadataDb newDb : dbs) {
                if (oldDb.getName().equals(newDb.getName())) {
                    BeanUtil.copyProperties(newDb, oldDb, CopyOptions.create(null, true));
                    updates.add(oldDb);
                    oldExists = true;
                    break;
                }
            }
            if (!oldExists) {
                removes.add(oldDb);
            }
        }
        for (MetadataDb newDb : dbs) {
            boolean newExists = false;
            for (MetadataDb oldDb : oldMetadataDb) {
                if (oldDb.getName().equals(newDb.getName())) {
                    newExists = true;
                    break;
                }
            }
            if (!newExists) {
                adds.add(newDb);
            }
        }

        if (task.getUpdateStrategy().equals("ignore")) {
        } else if (task.getUpdateStrategy().equals("update")) {
            metadataDbService.saveOrUpdateBatch(updates);
        } else if (task.getUpdateStrategy().equals("add")) {
            metadataDbService.saveOrUpdateBatch(adds);
        } else {
            metadataDbService.saveOrUpdateBatch(updates);
            metadataDbService.saveOrUpdateBatch(adds);
        }
        if (task.getDeleteStrategy().equals("ignore")) {
        } else {
            metadataDbService.removeBatchByIds(removes);
        }
        for (MetadataDb db : updates) {
            String position = task.getDatasourceId() + "_" + db.getName();
            for (MetadataTable table : tbls) {
                if (position.equals(table.getPosition())) {
                    table.setDbId(db.getId());
                }
            }
        }
        for (MetadataDb db : adds) {
            String position = task.getDatasourceId() + "_" + db.getName();
            for (MetadataTable table : tbls) {
                if (position.equals(table.getPosition())) {
                    table.setDbId(db.getId());
                }
            }
        }
        this.saveOrUpdateMetadataTbl(task, tbls, cols);
    }

    private void saveOrUpdateMetadataTbl(MetadataTask task, List<MetadataTable> tbls, List<MetadataColumn> cols) {
        Set<Integer> dbIds = new HashSet<>();
        for (MetadataTable table : tbls) {
            dbIds.add(table.getDbId());
        }
        QueryWrapper<MetadataTable> wrapper = Wrappers.<MetadataTable>query().eq("datasource_id", task.getDatasourceId());
        if (dbIds.size() > 0) {
            wrapper.in("db_id", dbIds);
        }

        List<MetadataTable> oldMetadataTable = metadataTableService.list(wrapper);
        List<MetadataTable> updates = new ArrayList<>();
        List<MetadataTable> removes = new ArrayList<>();
        List<MetadataTable> adds = new ArrayList<>();
        for (MetadataTable oldTable : oldMetadataTable) {
            boolean oldExists = false;
            for (MetadataTable newTable : tbls) {
                if (oldTable.getName().equals(newTable.getName()) && oldTable.getDbId().intValue() == newTable.getDbId().intValue()) {
                    BeanUtil.copyProperties(newTable, oldTable, CopyOptions.create(null, true));
                    updates.add(oldTable);
                    oldExists = true;
                    break;
                }
            }
            if (!oldExists) {
                removes.add(oldTable);
            }
        }
        for (MetadataTable newTable : tbls) {
            boolean newExists = false;
            for (MetadataTable oldTable : oldMetadataTable) {
                if (oldTable.getName().equals(newTable.getName()) && oldTable.getDbId().intValue() == newTable.getDbId().intValue()) {
                    newExists = true;
                    break;
                }
            }
            if (!newExists) {
                adds.add(newTable);
            }
        }

        if (task.getUpdateStrategy().equals("ignore")) {
        } else if (task.getUpdateStrategy().equals("update")) {
            metadataTableService.saveOrUpdateBatch(updates);
        } else if (task.getUpdateStrategy().equals("add")) {
            metadataTableService.saveOrUpdateBatch(adds);
        } else {
            metadataTableService.saveOrUpdateBatch(updates);
            metadataTableService.saveOrUpdateBatch(adds);
        }
        if (task.getDeleteStrategy().equals("ignore")) {
        } else {
            metadataTableService.removeBatchByIds(removes);
        }

        for (MetadataTable table : updates) {
            String position = task.getDatasourceId() + "_" + table.getDbName() + "_" + table.getName();
            for (MetadataColumn col : cols) {
                if (position.equals(col.getPosition())) {
                    col.setDbId(table.getDbId());
                    col.setTableId(table.getId());
                }
            }
        }
        for (MetadataTable table : adds) {
            String position = task.getDatasourceId() + "_" + table.getDbName() + "_" + table.getName();
            for (MetadataColumn col : cols) {
                if (position.equals(col.getPosition())) {
                    col.setDbId(table.getDbId());
                    col.setTableId(table.getId());
                }
            }
        }
        this.saveOrUpdateMetadataCol(task, cols);
    }

    private void saveOrUpdateMetadataCol(MetadataTask task, List<MetadataColumn> cols) {
        Set<Integer> tableIds = new HashSet<>();
        for (MetadataColumn col : cols) {
            tableIds.add(col.getTableId());
        }
        QueryWrapper<MetadataColumn> wrapper = Wrappers.<MetadataColumn>query().eq("datasource_id", task.getDatasourceId());
        if (tableIds.size() > 0) {
            wrapper.in("table_id", tableIds);
        }

        List<MetadataColumn> oldMetadataColumn = metadataColumnService.list(wrapper);
        List<MetadataColumn> updates = new ArrayList<>();
        List<MetadataColumn> removes = new ArrayList<>();
        List<MetadataColumn> adds = new ArrayList<>();
        for (MetadataColumn oldColumn : oldMetadataColumn) {
            boolean oldExists = false;
            for (MetadataColumn newColumn : cols) {
                if (oldColumn.getName().equals(newColumn.getName()) && oldColumn.getTableId().intValue() == newColumn.getTableId().intValue()) {
                    BeanUtil.copyProperties(newColumn, oldColumn, CopyOptions.create(null, true));
                    updates.add(oldColumn);
                    oldExists = true;
                    break;
                }
            }
            if (!oldExists) {
                removes.add(oldColumn);
            }
        }
        for (MetadataColumn newColumn : cols) {
            boolean newExists = false;
            for (MetadataColumn oldColumn : oldMetadataColumn) {
                if (oldColumn.getName().equals(newColumn.getName()) && oldColumn.getTableId().intValue() == newColumn.getTableId().intValue()) {
                    newExists = true;
                    break;
                }
            }
            if (!newExists) {
                adds.add(newColumn);
            }
        }

        if (task.getUpdateStrategy().equals("ignore")) {
        } else if (task.getUpdateStrategy().equals("update")) {
            metadataColumnService.saveOrUpdateBatch(updates);
        } else if (task.getUpdateStrategy().equals("add")) {
            metadataColumnService.saveOrUpdateBatch(adds);
        } else {
            metadataColumnService.saveOrUpdateBatch(updates);
            metadataColumnService.saveOrUpdateBatch(adds);
        }
        if (task.getDeleteStrategy().equals("ignore")) {
        } else {
            metadataColumnService.removeBatchByIds(removes);
        }
    }

}
