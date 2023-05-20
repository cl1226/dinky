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
  'application/x-www-form-urlencoded' = 'application/x-www-form-urlencoded',
  'application/json' = 'application/json',
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
