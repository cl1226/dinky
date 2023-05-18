package com.dlink.utils;

import com.github.freakchick.orange.engine.DynamicSqlEngine;

/**
 * SqlEngineUtils
 *
 * @author cl1226
 * @since 2023/5/17 16:53
 **/
public class SqlEngineUtils {

    static DynamicSqlEngine engine = new DynamicSqlEngine();

    public static DynamicSqlEngine getEngine() {
        return engine;
    }

}
