// 部署方式
export enum EDeployMode {
  cluster = 'cluster',
  client = 'client',
  local = 'local',
}

// 任务优先级
export enum EPriority {
  HIGHEST = 'HIGHEST',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  LOWEST = 'LOWEST',
}
// 程序类型
export enum EProgramType {
  JAVA = 'JAVA',
  SCALA = 'SCALA',
  PYTHON = 'PYTHON',
  SQL = 'SQL',
}

// SPARK 版本
export enum ESparkVersion {
  SPARK2 = 'SPARK2',
  SPARK1 = 'SPARK1',
}

// 文件类型
export enum EFileType {
  txt = 'txt',
  json = 'json',
  csv = 'csv',
  excel = 'excel',
  parquet = 'parquet',
  orc = 'orc',
}
