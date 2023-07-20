package com.dlink.model;

import com.dlink.db.model.SuperEntity;

import java.util.List;
import java.util.Map;

/**
 * SparkInfo
 *
 * @author cl1226
 * @since 2023/7/7 13:47
 **/
public class SparkInfo extends SuperEntity {

    private String description;

    private String priority;

    private String mainClass;

    private String mainJarPath;

    private String deployMode;

    private String taskName;

    private Integer driverCores;

    private String driverMemory;

    private String executorInstances;

    private String executorMemory;

    private String executorCores;

    private String mainClassParameters;

    private String optionParameters;

    private String resourcePaths;

    private List<Map<String, String>> definedProps;

}
