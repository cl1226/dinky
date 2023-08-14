package com.dlink.context;

/**
 * WorkspaceContextHolder
 *
 * @author cl1226
 * @since 2023/8/1 16:59
 **/
public class WorkspaceContextHolder {

    private static final ThreadLocal<Object> WORKSPACE_CONTEXT = new ThreadLocal<>();

    public static void set(Object value) {
        WORKSPACE_CONTEXT.set(value);
    }

    public static Object get() {
        return WORKSPACE_CONTEXT.get();
    }

    public static void clear() {
        WORKSPACE_CONTEXT.remove();
    }

}
