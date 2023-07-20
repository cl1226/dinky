package com.dlink.utils;

import com.alibaba.druid.DbType;
import com.alibaba.druid.sql.SQLUtils;
import com.alibaba.druid.sql.ast.SQLLimit;
import com.alibaba.druid.sql.ast.SQLStatement;
import com.alibaba.druid.sql.ast.statement.SQLSelect;
import com.alibaba.druid.sql.ast.statement.SQLSelectStatement;
import com.alibaba.druid.sql.parser.SQLParserUtils;
import com.alibaba.druid.sql.parser.SQLStatementParser;
import com.dlink.service.DataBaseService;
import net.sf.jsqlparser.JSQLParserException;
import net.sf.jsqlparser.expression.Expression;
import net.sf.jsqlparser.expression.LongValue;
import net.sf.jsqlparser.parser.CCJSqlParserUtil;
import net.sf.jsqlparser.parser.ParseException;
import net.sf.jsqlparser.statement.select.Limit;
import net.sf.jsqlparser.statement.select.PlainSelect;
import net.sf.jsqlparser.statement.select.Select;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.sql.*;
import java.util.Objects;
import java.util.Properties;

/**
 * JdbcTest
 *
 * @author cl1226
 * @since 2023/7/8 9:41
 **/
public class JdbcTest {

    @Autowired
    private DataBaseService dataBaseService;

    @Test
    public void test() throws ClassNotFoundException, InstantiationException, IllegalAccessException, ParseException, JSQLParserException {
        String sql = "select count(1) from dlink.dlink_task where id=";
        Class clazz = Class.forName("com.mysql.cj.jdbc.Driver");
        Driver driver = (Driver) clazz.newInstance();
        Properties info = new Properties();
        info.setProperty("user", "fanglei");
        info.setProperty("password", "FangLei@2023");
        Connection connection = null;
        PreparedStatement statement = null;

//        SQLStatement sqlStatement = SQLUtils.parseSingleStatement(sql, DbType.mysql, true);
//        SQLStatementParser sqlStatementParser = SQLParserUtils.createSQLStatementParser(sql, DbType.mysql);
//        SQLSelectStatement statement1 = (SQLSelectStatement) sqlStatementParser.parseStatement();
//
//        SQLSelect select = statement1.getSelect();
//
//        SQLLimit limit = select.getLimit();
//        if (Objects.nonNull(limit)) {
//            System.out.println("行:"+limit.getRowCount());
//            System.out.println("偏移量:"+limit.getOffset());
//        }

        Select select = (Select) CCJSqlParserUtil.parse(sql);
        PlainSelect plainSelect = (PlainSelect) select.getSelectBody();
        System.out.println(plainSelect.toString());



//        try {
//            connection = driver.connect("jdbc:mysql://10.36.22.96:3306/paperless?useSSL=false&useUnicode=true&characterEncoding=UTF-8&characterSetResults=UTF-8&zeroDateTimeBehavior=CONVERT_TO_NULL&serverTimezone=UTC", info);
//            statement = connection.prepareStatement(sql, ResultSet.TYPE_FORWARD_ONLY, ResultSet.CONCUR_READ_ONLY);
//            statement.setFetchSize(Integer.MIN_VALUE);
//            boolean hasResultSet = statement.execute();
//            if (hasResultSet) {
//                ResultSet rs = statement.getResultSet();
//                int count = 0;
//                while (rs.next()) {
//                    System.out.println(rs.getString("item_name"));
//                    count++;
//                    if (count >= 10) {
//                        break;
//                    }
//                }
//                rs.close();
//            }
//        } catch (SQLException throwables) {
//            throwables.printStackTrace();
//        } finally {
//            try {
//                statement.close();
//            } catch (SQLException throwables) {
//                throwables.printStackTrace();
//            }
//            try {
//                connection.close();
//            } catch (SQLException throwables) {
//                throwables.printStackTrace();
//            }
//        }


    }

}
