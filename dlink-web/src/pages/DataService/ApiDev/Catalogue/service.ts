import { request2, CODE } from '@/components/Common/crud'
import { message } from 'antd'
import { l } from '@/utils/intl'

export async function addOrUpdateData(url: string, params: any) {
  return request2(url, {
    method: 'PUT',
    data: {
      ...params,
    },
  })
}

export const handleAddOrUpdate = async (url: string, fields: any) => {
  const tipsTitle = fields.id ? l('app.request.update') : l('app.request.add')
  const hide = message.loading(l('app.request.running') + tipsTitle)
  try {
    const { code, msg } = await addOrUpdateData(url, { ...fields })
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

export const getAllCatalogueTreeData = () => {
  return request2('/api/dataservice/catalogue/getCatalogueTreeData', {
    method: 'GET',
  })
}

export const removeCatalogueById = async (id: number) => {
  const hide = message.loading(l('app.request.delete'))
  try {
    const { code, msg } = await request2(`/api/dataservice/catalogue?id=${id}`, {
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
