/*
 *
 *  Licensed to the Apache Software Foundation (ASF) under one or more
 *  contributor license agreements.  See the NOTICE file distributed with
 *  this work for additional information regarding copyright ownership.
 *  The ASF licenses this file to You under the Apache License, Version 2.0
 *  (the "License"); you may not use this file except in compliance with
 *  the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

package com.dlink.metadata.driver;

import cn.hutool.json.JSONObject;
import com.dlink.assertion.Asserts;
import com.dlink.metadata.constant.HiveConstant;
import com.dlink.metadata.convert.HiveTypeConvert;
import com.dlink.metadata.convert.ITypeConvert;
import com.dlink.metadata.query.HiveQuery;
import com.dlink.metadata.query.IDBQuery;
import com.dlink.metadata.result.JdbcSelectResult;
import com.dlink.model.Column;
import com.dlink.model.Schema;
import com.dlink.model.Table;
import com.dlink.utils.LogUtil;

import org.apache.commons.lang3.StringUtils;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.security.UserGroupInformation;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class HiveDriver extends AbstractJdbcDriver implements Driver {

    @Override
    public Table getTable(String schemaName, String tableName) {
        List<Table> tables = listTables(schemaName);
        Table table = null;
        for (Table item : tables) {
            if (Asserts.isEquals(item.getName(), tableName)) {
                table = item;
                break;
            }
        }
        if (Asserts.isNotNull(table)) {
            table.setColumns(listColumns(schemaName, table.getName()));
        }
        return table;
    }

    @Override
    public List<Table> listTables(String schemaName) {
        List<Table> tableList = new ArrayList<>();
        PreparedStatement preparedStatement = null;
        ResultSet results = null;
        IDBQuery dbQuery = getDBQuery();
        String sql = dbQuery.tablesSql(schemaName);
        try {
            execute(String.format(HiveConstant.USE_DB, schemaName));
            preparedStatement = conn.get().prepareStatement(sql);
            results = preparedStatement.executeQuery();
            ResultSetMetaData metaData = results.getMetaData();
            List<String> columnList = new ArrayList<>();
            for (int i = 1; i <= metaData.getColumnCount(); i++) {
                columnList.add(metaData.getColumnLabel(i));
            }
            while (results.next()) {
                String tableName = results.getString(dbQuery.tableName());
                if (Asserts.isNotNullString(tableName)) {
                    Table tableInfo = new Table();
                    tableInfo.setName(tableName);
                    if (columnList.contains(dbQuery.tableComment())) {
                        tableInfo.setComment(results.getString(dbQuery.tableComment()));
                    }
                    tableInfo.setSchema(schemaName);
                    if (columnList.contains(dbQuery.tableType())) {
                        tableInfo.setType(results.getString(dbQuery.tableType()));
                    }
                    if (columnList.contains(dbQuery.catalogName())) {
                        tableInfo.setCatalog(results.getString(dbQuery.catalogName()));
                    }
                    if (columnList.contains(dbQuery.engine())) {
                        tableInfo.setEngine(results.getString(dbQuery.engine()));
                    }
                    tableList.add(tableInfo);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            close(preparedStatement, results);
        }
        return tableList;
    }

    @Override
    public List<Schema> getSchemasAndTables() {
        return listSchemas();
    }

    @Override
    public List<Schema> getSchemasAndTablesV2() {
        return listSchemas();
    }

    @Override
    public JSONObject showDatabase(String name) {
        PreparedStatement preparedStatement = null;
        ResultSet results = null;
        JSONObject jsonObject = new JSONObject();
        try {
            String sql = "desc database "+ name;
            preparedStatement = conn.get().prepareStatement(sql);
            results = preparedStatement.executeQuery();
            while (results.next()) {
                jsonObject.set("db_name", results.getString(1));
                jsonObject.set("comment", results.getString(2));
                jsonObject.set("location", results.getString(3));
                jsonObject.set("owner_name", results.getString(4));
                jsonObject.set("owner_type", results.getString(5));
                jsonObject.set("parameters", results.getString(6));
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            close(preparedStatement, results);
        }
        return jsonObject;
    }

    private static Map<String, String> getDescTableModule() {
        Map<String, String> descTableModule = new HashMap<>();

        descTableModule.put("# col_name", "col_name");
        descTableModule.put("# Detailed Table Information", "table_info");
        descTableModule.put("Table Parameters:", "table_param");
        descTableModule.put("# Storage Information", "storage_info");
        descTableModule.put("Storage Desc Params:", "storage_desc");
        descTableModule.put("# Not Null Constraints", "not_null_constraint");
        descTableModule.put("# Default Constraints", "default_constraint");
        descTableModule.put("# Partition Information", "partition_info");

        return descTableModule;
    }

    @Override
    public Map<String, Object> showFormattedTable(String schemaName, String tableName) {
        PreparedStatement preparedStatement = null;
        ResultSet results = null;
        Map<String, Object> result = new HashMap<>();
        try {
            String sql = String.format("describe formatted `%s`.`%s`", schemaName, tableName);
            preparedStatement = conn.get().prepareStatement(sql);
            results = preparedStatement.executeQuery();

            // 定义多个集合用于存储hive不同模块的元数据
            Map<String, String> detailTableInfo = new HashMap<>();
            Map<String, String> tableParams = new HashMap<>();
            Map<String, String> storageInfo = new HashMap<>();
            Map<String, String> storageDescParams = new HashMap<>();
            Map<String, Map<String, String>> constraints = new HashMap<>();
            List<Column> columns = new ArrayList<>();

            Map<String, String> moduleMap = getDescTableModule();

            // 解析resultSet获得原始的分块数据
            String infoModule = "";

            while (results.next()) {
                String title = results.getString(1).trim();
                if (("".equals(title) && results.getString(2) == null) || "# Constraints".equals(title)) {
                    continue;
                }
                if (moduleMap.containsKey(title)) {
                    if ("partition_info".equals(infoModule) && "col_name".equals(moduleMap.get(title))) {
                        continue;
                    }
                    infoModule = moduleMap.get(title);
                    continue;
                }
                String key = null;
                String value = null;
                switch (infoModule) {
                    case "col_name":
                        Column column = new Column();
                        column.setName(results.getString(1));
                        column.setType(results.getString(2));
                        column.setComment(results.getString(3));
                        column.setPartition(false);
                        columns.add(column);
                        break;

                    case "table_info":
                        if (results.getString(1) != null && results.getString(2) != null) {
                            key = results.getString(1).trim().replace(":", "");
                            value = results.getString(2).trim();
                            detailTableInfo.put(key, value);
                        }
                        break;

                    case "table_param":
                        if (results.getString(2) != null && results.getString(3) != null) {
                            key = results.getString(2).trim().replace(":", "");
                            value = results.getString(3).trim();
                            tableParams.put(key, value);
                        }
                        break;

                    case "storage_info":
                        if (results.getString(1) != null && results.getString(2) != null) {
                            key = results.getString(1).trim().replace(":", "");
                            value = results.getString(2).trim();
                            storageInfo.put(key, value);
                        }
                        break;

                    case "storage_desc":
                        if (results.getString(2) != null && results.getString(3) != null) {
                            key = results.getString(2).trim().replace(":", "");
                            value = results.getString(3).trim();
                            storageDescParams.put(key, value);
                        }
                        break;

                    case "not_null_constraint":
                        Map<String, String> notNullMap = constraints.getOrDefault("notnull", new HashMap<>());
                        if ("Table:".equals(title.trim())) {
                            results.next();
                        }

                        String notNullConstraintName = results.getString(2).trim();
                        results.next();

                        key = results.getString(2).trim();
                        notNullMap.put(key, notNullConstraintName);

                        constraints.put("notnull", notNullMap);
                        break;

                    case "default_constraint":
                        Map<String, String> defaultMap = constraints.getOrDefault("default", new HashMap<>());
                        if ("Table:".equals(title.trim())) {
                            results.next();
                        }

                        String defaultConstraintName = results.getString(2).trim();
                        results.next();

                        key = results.getString(1).trim().split(":")[1];
                        value = results.getString(2).trim();
                        int valueIndex = value.indexOf(":");
                        value = value.substring(valueIndex + 1);

                        defaultMap.put(key + "_constraintName", defaultConstraintName);

                        constraints.put("default", defaultMap);
                        break;

                    case "partition_info":
                        Column column1 = new Column();
                        column1.setName(results.getString(1));
                        column1.setType(results.getString(2));
                        column1.setComment(results.getString(3));
                        column1.setPartition(true);
                        columns.add(column1);
                        break;

                    default:
                        System.out.print("unknown module,please update method to support it : " + infoModule);
                }
            }
            result.put("columns",columns);
            result.put("detailTableInfo",detailTableInfo);
            result.put("tableParams",tableParams);
            result.put("storageInfo",storageInfo);
            result.put("storageDescParams",storageDescParams);
            result.put("constraints",constraints);
            return result;
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            close(preparedStatement, results);
        }
        return null;
    }

    @Override
    public List<Schema> listSchemas() {

        List<Schema> schemas = new ArrayList<>();
        PreparedStatement preparedStatement = null;
        ResultSet results = null;
        String schemasSql = getDBQuery().schemaAllSql();
        try {
            preparedStatement = conn.get().prepareStatement(schemasSql);
            results = preparedStatement.executeQuery();
            while (results.next()) {
                String schemaName = results.getString(getDBQuery().schemaName());
                if (Asserts.isNotNullString(schemaName)) {
                    Schema schema = new Schema(schemaName);
                    if (execute(String.format(HiveConstant.USE_DB, schemaName))) {
                        schema.setTables(listTables(schema.getName()));
                    }
                    schemas.add(schema);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            close(preparedStatement, results);
        }
        return schemas;
    }

    @Override
    public List<Column> listColumns(String schemaName, String tableName) {
        List<Column> columns = new ArrayList<>();
        PreparedStatement preparedStatement = null;
        ResultSet results = null;
        IDBQuery dbQuery = getDBQuery();
        String tableFieldsSql = dbQuery.columnsSql(schemaName, tableName);
        try {
            preparedStatement = conn.get().prepareStatement(tableFieldsSql);
            results = preparedStatement.executeQuery();
            ResultSetMetaData metaData = results.getMetaData();
            List<String> columnList = new ArrayList<>();
            for (int i = 1; i <= metaData.getColumnCount(); i++) {
                columnList.add(metaData.getColumnLabel(i));
            }
            Integer positionId = 1;
            while (results.next()) {
                Column field = new Column();
                if (StringUtils.isEmpty(results.getString(dbQuery.columnName()))) {
                    break;
                } else {
                    if (columnList.contains(dbQuery.columnName())) {
                        String columnName = results.getString(dbQuery.columnName());
                        field.setName(columnName);
                    }
                    if (columnList.contains(dbQuery.columnType())) {
                        field.setType(results.getString(dbQuery.columnType()));
                    }
                    if (columnList.contains(dbQuery.columnComment()) && Asserts.isNotNull(results.getString(dbQuery.columnComment()))) {
                        String columnComment = results.getString(dbQuery.columnComment()).replaceAll("\"|'", "");
                        field.setComment(columnComment);
                    }
                    field.setPosition(positionId++);
                    field.setJavaType(getTypeConvert().convert(field));
                }
                columns.add(field);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            close(preparedStatement, results);
        }
        return columns;
    }

    @Override
    public String getCreateTableSql(Table table) {
        StringBuilder createTable = new StringBuilder();
        PreparedStatement preparedStatement = null;
        ResultSet results = null;
        String createTableSql = getDBQuery().createTableSql(table.getSchema(), table.getName());
        try {
            preparedStatement = conn.get().prepareStatement(createTableSql);
            results = preparedStatement.executeQuery();
            while (results.next()) {
                createTable.append(results.getString(getDBQuery().createTableName())).append("\n");
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            close(preparedStatement, results);
        }
        return createTable.toString();
    }

    @Override
    public int executeUpdate(String sql) throws Exception {

//        if (config.getUrl().contains("principal")) {
//            System.setProperty("java.security.krb5.conf", "/etc/krb5.conf");
//            Configuration configuration = new Configuration();
//            configuration.set("hadoop.security.authentication" , "Kerberos");
//            configuration.setBoolean("hadoop.security.authorization", true);
//            UserGroupInformation.setConfiguration(configuration);
//            UserGroupInformation.loginUserFromKeytab("svolt@SVOLT.COM" , "/opt/keytab/svolt.keytab");
//        }

        Asserts.checkNullString(sql, "Sql 语句为空");
        String querySQL = sql.trim().replaceAll(";$", "");
        int res = 0;
        try (Statement statement = conn.get().createStatement()) {
            res = statement.executeUpdate(querySQL);
        }
        return res;
    }

    @Override
    public JdbcSelectResult query(String sql, Integer limit) {
        if (Asserts.isNull(limit)) {
            limit = 100;
        }
        JdbcSelectResult result = new JdbcSelectResult();
        List<LinkedHashMap<String, Object>> datas = new ArrayList<>();
        List<Column> columns = new ArrayList<>();
        List<String> columnNameList = new ArrayList<>();
        PreparedStatement preparedStatement = null;
        ResultSet results = null;
        int count = 0;
        try {
            String querySQL = sql.trim().replaceAll(";$", "");
            preparedStatement = conn.get().prepareStatement(querySQL);
            results = preparedStatement.executeQuery();
            if (Asserts.isNull(results)) {
                result.setSuccess(true);
                close(preparedStatement, results);
                return result;
            }
            ResultSetMetaData metaData = results.getMetaData();
            for (int i = 1; i <= metaData.getColumnCount(); i++) {
                columnNameList.add(metaData.getColumnLabel(i));
                Column column = new Column();
                column.setName(metaData.getColumnLabel(i));
                column.setType(metaData.getColumnTypeName(i));
                column.setAutoIncrement(metaData.isAutoIncrement(i));
                column.setNullable(metaData.isNullable(i) == 0 ? false : true);
                column.setJavaType(getTypeConvert().convert(column));
                columns.add(column);
            }
            result.setColumns(columnNameList);
            while (results.next()) {
                LinkedHashMap<String, Object> data = new LinkedHashMap<>();
                for (int i = 0; i < columns.size(); i++) {
                    data.put(columns.get(i).getName(), getTypeConvert().convertValue(results, columns.get(i).getName(), columns.get(i).getType()));
                }
                datas.add(data);
                count++;
                if (count >= limit) {
                    break;
                }
            }
            result.setSuccess(true);
        } catch (Exception e) {
            result.setError(LogUtil.getError(e));
            result.setSuccess(false);
        } finally {
            close(preparedStatement, results);
            result.setRowData(datas);
            return result;
        }    }

    @Override
    public IDBQuery getDBQuery() {
        return new HiveQuery();
    }

    @Override
    public ITypeConvert getTypeConvert() {
        return new HiveTypeConvert();
    }

    @Override
    String getDriverClass() {
        return "org.apache.hive.jdbc.HiveDriver";
    }

    @Override
    public String getType() {
        return "Hive";
    }

    @Override
    public String getName() {
        return "Hive";
    }

    @Override
    public Map<String, String> getFlinkColumnTypeConversion() {
        HashMap<String, String> map = new HashMap<>();
        map.put("BOOLEAN", "BOOLEAN");
        map.put("TINYINT", "TINYINT");
        map.put("SMALLINT", "SMALLINT");
        map.put("INT", "INT");
        map.put("VARCHAR", "STRING");
        map.put("TEXY", "STRING");
        map.put("INT", "INT");
        map.put("DATETIME", "TIMESTAMP");
        return map;
    }
}
