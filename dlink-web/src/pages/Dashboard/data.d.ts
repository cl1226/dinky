export type ClientTableListItem = {
  id: number
  name: string
  hostname?: string
  clusterName?: string
  clusterId?: number
  ip: string
  port: string
  username: string
  password: string
  description?: string
  createTime: Date
  updateTime: Date
}
