import type { FormInstance } from 'antd'

export type CreatePageMode = 'edit' | 'create'

export interface ICreateTaskStepComProps {
  form: FormInstance
  initialValues: object
  mode: CreatePageMode
}

type CatalogueValue = {
  id: number | string
  path: string
  [key: string]: any
}

export interface ITaskItem {
  id?: number
  catalogueId: number
  createTime: string
  cronExpression: string | null
  datasourceId: number
  datasourceType: number | string
  deleteStrategy: string
  description: string
  name: string
  path?: string
  scheduleType: string
  status: string | number | null
  updateStrategy: string
  updateTime: string
}

export interface ICreateTaskItem extends ITaskItem {
  catalogue?: CatalogueValue
}
