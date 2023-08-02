import type { FormInstance, FormLabelAlign } from 'antd/es/form'

export interface ICluster {
  type: any
  clusterName: string
  clusterStatus: string
  createTime: string
  enabled: boolean
  hdfsHa: boolean
  hiveHa: boolean
  hiveserverAddress: string
  id: number
  kerberos: boolean
  metastoreAddress: string
  name: string
  namenodeAddress: string
  password: string
  resourcemanagerAddress: string
  updateTime: string
  url: string
  username: string
  version: string
  yarnHa: boolean
  zkQuorum: string
  kdcHost: string
  realm: string
  uuid: string
  yarnQueueModels?: IYarnQueueItem[]
  keytabJson?: string
  krb5?: string
  xmlUrls?: string
}

export interface IYarnQueueItem {
  aclSubmitApps?: string
  clusterName?: string
  clusterUUID?: string
  name?: string
  policy?: string
  children?: IYarnQueueItem[]
}

export interface IFormLayout {
  labelCol: { [key: string]: any }
  labelAlign: FormLabelAlign
  labelWrap: boolean
  wrapperCol: { [key: string]: any }
  colon: boolean
}

export const formLayout: IFormLayout = {
  labelCol: { flex: '150px' },
  labelAlign: 'right',
  labelWrap: true,
  wrapperCol: { flex: 1 },
  colon: false,
}

export interface ITabComProps {
  mode?: 'create' | 'edit' | 'view'
  detailInfo?: any
}

export type UserTableListItem = {
  id?: number
  enabled?: boolean
  isDelete?: string
  createTime?: Date
  updateTime?: Date
  username?: string
  nickname?: string
  password?: string
  avatar?: string
  worknum?: string
  mobile?: string
}
export type RoleTableListItem = {
  id?: number
  tenantId?: number
  tenant: TenantTableListItem
  roleCode?: string
  roleName?: string
  namespaceIds?: string
  namespaces?: NameSpaceTableListItem[]
  isDelete?: boolean
  note?: string
  createTime?: Date
  updateTime?: Date
}

export type PasswordItem = {
  username: string
  password?: string
  newPassword?: string
  newPasswordCheck?: string
}
