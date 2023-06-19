package com.dlink.utils;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import lombok.extern.slf4j.Slf4j;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Slf4j
public class JdbcUtil {

    /**
     * 没有关闭连接，需要在调用方关闭
     *
     * @param connection
     * @param sql
     * @param jdbcParamValues
     * @return
     */
    public static Object executeSql(Connection connection, String sql, List<Object> jdbcParamValues) throws SQLException {
        log.debug(sql);
        log.debug(JSON.toJSONString(jdbcParamValues));
        PreparedStatement statement = connection.prepareStatement(sql);
        //参数注入
        for (int i = 1; i <= jdbcParamValues.size(); i++) {
            statement.setObject(i, jdbcParamValues.get(i - 1));
        }
        boolean hasResultSet = statement.execute();

        if (hasResultSet) {
            ResultSet rs = statement.getResultSet();
            int columnCount = rs.getMetaData().getColumnCount();

            List<String> columns = new ArrayList<>();
            for (int i = 1; i <= columnCount; i++) {
                String columnName = rs.getMetaData().getColumnLabel(i);
                columns.add(columnName);
            }
            List<JSONObject> list = new ArrayList<>();
            while (rs.next()) {
                JSONObject jo = new JSONObject();
                columns.stream().forEach(t -> {
                    try {
                        Object value = rs.getObject(t);
                        jo.put(t, value);
                    } catch (SQLException throwables) {
                        throwables.printStackTrace();
                    }
                });
                list.add(jo);
            }
            rs.close();
            statement.close();
            return list;
        } else {
            int updateCount = statement.getUpdateCount();
            statement.close();
            return updateCount + " rows affected";
        }

    }
}