import { request2, CODE } from '@/components/Common/crud'
import { message } from 'antd'
import { l } from '@/utils/intl'

export interface IGetApiConfigListParams {
  catalogueId?: number
  name?: string
  pageIndex: number
  pageSize: number
}

export async function addOrUpdateCatalogue(url: string, params: any) {
  return request2(url, {
    method: 'PUT',
    data: {
      ...params,
    },
  })
}

export const handleAddOrUpdateCatalogue = async (url: string, fields: any) => {
  const tipsTitle = fields.id ? l('app.request.update') : l('app.request.add')
  const hide = message.loading(l('app.request.running') + tipsTitle)
  try {
    const { code, msg } = await addOrUpdateCatalogue(url, { ...fields })
    hide()
    if (code == CODE.SUCCESS) {
      return true
    } else {
      message.warn(msg)
      return false
    }
  } catch (error) {
    hide()
    message.error(l('app.request.error'))
    return false
  }
}

export const removeCatalogueById = async (url, id: number) => {
  const hide = message.loading(l('app.request.delete'))
  try {
    const { code, msg } = await request2(`${url}?id=${id}`, {
      method: 'DELETE',
    })
    hide()
    if (code == CODE.SUCCESS) {
      message.success(msg)
    } else {
      message.warn(msg)
    }
    return true
  } catch (error) {
    hide()
    message.error(l('app.request.delete.error'))
    return false
  }
}
