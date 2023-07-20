package com.dlink.utils;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import lombok.extern.slf4j.Slf4j;
import net.sf.jsqlparser.JSQLParserException;
import net.sf.jsqlparser.expression.Expression;
import net.sf.jsqlparser.expression.LongValue;
import net.sf.jsqlparser.parser.CCJSqlParserUtil;
import net.sf.jsqlparser.statement.select.Limit;
import net.sf.jsqlparser.statement.select.PlainSelect;
import net.sf.jsqlparser.statement.select.Select;

import java.io.PrintWriter;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

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
    public static Object executeSql(Connection connection, String sql, List<Object> jdbcParamValues, PrintWriter writer) {
        log.debug(sql);
        log.debug(JSON.toJSONString(jdbcParamValues));
        PreparedStatement statement = null;
        JSONObject jsonObject = new JSONObject();
        String executeSQL = "";
        Select select = null;
        String parsedSQL = sql;
        String pagingMsg = "";
        try {
            select = (Select) CCJSqlParserUtil.parse(sql);
            PlainSelect plainSelect = (PlainSelect) select.getSelectBody();
            Limit limit = plainSelect.getLimit();
            if (!Objects.nonNull(limit)) {
                Limit lim = new Limit();
                lim.setRowCount(new LongValue(500));
                lim.setOffset(new LongValue(0));
                plainSelect.setLimit(lim);
                pagingMsg = "查询未分页，避免返回数据太多，最多仅展示500条数据";
            } else {
                Expression rowCount = plainSelect.getLimit().getRowCount();
                Integer count = Integer.valueOf(rowCount.toString());
                if (count > 500) {
                    plainSelect.setLimit(null);
                    Limit lim = new Limit();
                    lim.setRowCount(new LongValue(500));
                    lim.setOffset(new LongValue(0));
                    plainSelect.setLimit(lim);
                    pagingMsg = "分页数据太多，最多仅展示500条数据";
                }
            }
            parsedSQL = plainSelect.toString();
        } catch (JSQLParserException e) {
            e.printStackTrace();
        }

        try {
            statement = connection.prepareStatement(parsedSQL, ResultSet.TYPE_FORWARD_ONLY, ResultSet.CONCUR_READ_ONLY);
            statement.setFetchSize(Integer.MIN_VALUE);
            //参数注入
            for (int i = 1; i <= jdbcParamValues.size(); i++) {
                statement.setObject(i, jdbcParamValues.get(i - 1));
            }
            boolean hasResultSet = statement.execute();
            if (hasResultSet) {
                ResultSet rs = statement.getResultSet();
                executeSQL = rs.getStatement().toString();
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
                jsonObject.put("result", list);
                jsonObject.put("remark", pagingMsg);
                jsonObject.put("executeSQL", executeSQL.split(":")[1]);
                return jsonObject;
            } else {
                int updateCount = statement.getUpdateCount();
                return updateCount + " rows affected";
            }
        } catch (SQLException e) {
            e.printStackTrace();
            jsonObject.put("errorMsg", e.getMessage());
            jsonObject.put("executeSQL", "");
            return jsonObject;
        } finally {
            try {
                if (statement != null) {
                    statement.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    public static Object executeSqlLimit10(Connection connection, String sql, List<Object> jdbcParamValues) {
        String parsedSQL = sql;
        PreparedStatement statement = null;
        Select select = null;
        String executeSQL = "";
        JSONObject jsonObject = new JSONObject();
        try {
            select = (Select) CCJSqlParserUtil.parse(sql);
            PlainSelect plainSelect = (PlainSelect) select.getSelectBody();
            Limit limit = plainSelect.getLimit();
            if (!Objects.nonNull(limit)) {
                Limit lim = new Limit();
                lim.setRowCount(new LongValue(10));
                lim.setOffset(new LongValue(0));
                plainSelect.setLimit(lim);
            }
            parsedSQL = plainSelect.toString();
            statement = connection.prepareStatement(parsedSQL, ResultSet.TYPE_FORWARD_ONLY, ResultSet.CONCUR_READ_ONLY);
            statement.setFetchSize(Integer.MIN_VALUE);
            //参数注入
            for (int i = 1; i <= jdbcParamValues.size(); i++) {
                statement.setObject(i, jdbcParamValues.get(i - 1));
            }
            boolean hasResultSet = statement.execute();
            if (hasResultSet) {
                ResultSet rs = statement.getResultSet();
                executeSQL = rs.getStatement().toString();
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
                jsonObject.put("result", list);
                jsonObject.put("executeSQL", executeSQL.split(":")[1]);
                return jsonObject;
            } else {
                int updateCount = statement.getUpdateCount();
                return updateCount + " rows affected";
            }
        } catch (JSQLParserException | SQLException e) {
            e.printStackTrace();
        }
        return null;
    }
}