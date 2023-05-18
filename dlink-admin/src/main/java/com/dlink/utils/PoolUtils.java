package com.dlink.utils;

import com.alibaba.druid.pool.DruidDataSource;
import com.alibaba.druid.pool.DruidPooledConnection;
import com.dlink.assertion.Asserts;
import com.dlink.metadata.driver.AbstractJdbcDriver;
import com.dlink.metadata.driver.Driver;
import com.dlink.metadata.driver.DriverConfig;
import com.dlink.model.DataBase;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.sql.SQLException;
import java.util.Optional;
import java.util.ServiceLoader;
import java.util.concurrent.ConcurrentHashMap;

/**
 * PoolUtils
 *
 * @author cl1226
 * @since 2023/5/17 16:12
 **/
public class PoolUtils {

    static ConcurrentHashMap<String, DruidDataSource> map = new ConcurrentHashMap<>();

    public static DruidDataSource getJdbcConnectionPool(DataBase ds) throws NoSuchMethodException, InvocationTargetException, IllegalAccessException {
        if (map.containsKey(ds.getId().toString())) {
            return map.get(ds.getId().toString());
        } else {

            DruidDataSource druidDataSource = new DruidDataSource();
            druidDataSource.setName(ds.getName());
            druidDataSource.setUrl(ds.getUrl());
            druidDataSource.setUsername(ds.getUsername());
            Optional<Driver> driver = Driver.get(ds.getDriverConfig());
            Method method = AbstractJdbcDriver.class.getDeclaredMethod("getDriverClass", null);
            method.setAccessible(true);
            Object invoke = method.invoke(driver.get());

            druidDataSource.setDriverClassName(String.valueOf(invoke));
            druidDataSource.setConnectionErrorRetryAttempts(3);
            druidDataSource.setBreakAfterAcquireFailure(true);
            druidDataSource.setPassword(ds.getPassword());

            map.put(ds.getId().toString(), druidDataSource);
            return map.get(ds.getId().toString());

        }
    }

    //删除数据库连接池
    public static void removeJdbcConnectionPool(String id) {
        if (map.containsKey(id)) {
            DruidDataSource old = map.get(id);
            map.remove(id);
            old.close();
        }
    }

    public static DruidPooledConnection getPooledConnection(DataBase ds) throws SQLException {
        DruidDataSource pool = null;
        try {
            pool = PoolUtils.getJdbcConnectionPool(ds);
        } catch (NoSuchMethodException e) {
            e.printStackTrace();
        } catch (InvocationTargetException e) {
            e.printStackTrace();
        } catch (IllegalAccessException e) {
            e.printStackTrace();
        }
        DruidPooledConnection connection = pool.getConnection();
        return connection;
    }

}
