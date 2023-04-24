package com.dlink.model;

/**
 * WorkflowLifeCycle
 *
 * @author cl1226
 * @since 2023/4/24 14:17
 */
public enum WorkflowLifeCycle {

    UNKNOWN("UNKNOWN", "未知"),
    CREATE("CREATE", "创建"),
    DEPLOY("DEPLOY", "部署"),
    ONLINE("ONLINE", "上线"),
    OFFLINE("OFFLINE", "下线"),
    CANCEL("CANCEL", "注销");

    private String value;
    private String label;

    WorkflowLifeCycle(String value, String label) {
        this.value = value;
        this.label = label;
    }

    public String getValue() {
        return value;
    }

    public String getLabel() {
        return label;
    }

    public static WorkflowLifeCycle get(String value) {
        for (WorkflowLifeCycle item : WorkflowLifeCycle.values()) {
            if (item.getValue().equals(value)) {
                return item;
            }
        }
        return WorkflowLifeCycle.UNKNOWN;
    }

    public boolean equalsValue(Integer step) {
        if (value.equals(step)) {
            return true;
        }
        return false;
    }

}
