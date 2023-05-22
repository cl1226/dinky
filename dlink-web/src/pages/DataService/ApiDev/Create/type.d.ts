import type { FormInstance, FormLabelAlign } from 'antd/es/form'

export interface IFormLayout {
  labelCol: { [key: string]: any }
  labelAlign: FormLabelAlign
  labelWrap: boolean
  wrapperCol: { [key: string]: any }
  colon: boolean
}
export interface IStepComProps {
  form: FormInstance
  formLayout: IFormLayout
  forms: { [key: string]: any }
  mode: 'create' | 'edit'
  detailInfo?: { [key: string]: any }
}
