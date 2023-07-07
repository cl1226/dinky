// 部署方式
export enum EDeployMode {
  cluster = 'client',
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
  JAVA = 'HIGHEST',
  SCALA = 'HIGH',
  PYTHON = 'MEDIUM',
  SQL = 'LOW',
}

// SPARK 版本
export enum ESparkVersion {
  SPARK2 = 'SPARK2',
  SPARK1 = 'SPARK1',
}
