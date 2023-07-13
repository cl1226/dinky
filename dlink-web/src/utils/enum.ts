// 是否
export enum ETrueFalse {
  true = '是',
  false = '否',
}
// 请求方式
export enum ERequestMethod {
  GET = 'GET',
  POST = 'POST',
}
// 参数协议
export enum EParamProtocol {
  HTTP = 'HTTP',
  HTTPS = 'HTTPS',
}

// Content-Type
export enum EContentType {
  'application/json' = 'application/json',
  'application/x-www-form-urlencoded' = 'application/x-www-form-urlencoded',
}

// 缓存
export enum ECachePlugin {
  'None' = '不设置',
  'Memory' = '内存',
}

// 取数方式
export enum EAccessType {
  'sql' = '脚本方式',
  // 'configure' = '配置方式',
}

// 安全认证
export enum EAuthType {
  'none' = '无认证',
  'app' = 'APP认证',
}

// Token过期时间
export enum ETokenExpire {
  '5min' = '5分钟',
  '1hour' = '1小时',
  '1day' = '1天',
  '30day' = '30天',
  'once' = '单次有效',
  'forever' = '永久',
}

// Token过期时间
export enum EHadoopType {
  'CDH' = 'CDH(CM)',
  // 'HDP' = 'HDP(Ambari)',
  'Apache' = 'Apache Hadoop',
}
