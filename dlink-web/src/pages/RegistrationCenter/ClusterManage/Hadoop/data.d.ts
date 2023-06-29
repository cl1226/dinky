import type { FormInstance, FormLabelAlign } from 'antd/es/form'

export interface IHadoop {
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
  refreshHadoopInfo?: (hadoop: IHadoop, yarnQueue: IYarnQueueItem[]) => void
}
