import type { FormInstance, FormLabelAlign } from 'antd/es/form'

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
  detailInfo?: { [key: string]: any }
}
