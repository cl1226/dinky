package com.dlink.context;

/**
 * ClusterContextHolder
 *
 * @author cl1226
 * @since 2023/8/1 16:59
 **/
public class ClusterContextHolder {

    private static final ThreadLocal<Object> CLUSTER_CONTEXT = new ThreadLocal<>();

    public static void set(Object value) {
        CLUSTER_CONTEXT.set(value);
    }

    public static Object get() {
        return CLUSTER_CONTEXT.get();
    }

    public static void clear() {
        CLUSTER_CONTEXT.remove();
    }

}
