export const formLayout = {
  labelCol: { flex: '150px' },
  labelAlign: 'left',
  labelWrap: true,
  wrapperCol: { flex: 1 },
  colon: false,
}

// 根据接口详情赋值当前步骤的form数据
export const transferFormFieldsValue = (step: number, detail: any) => {
  if (step === 0) {
    const { authType, absolutePath, catalogueId, path, name, contentType, params, description,cachePlugin } =
      detail

    return {
      catalogue: {
        id: catalogueId,
        path: absolutePath,
      },
      path,
      name,
      contentType,
      params,
      description,
      authType,
      cachePlugin
    }
  } else if (step === 1) {
    const { accessType, datasourceType, datasourceId, datasourceDb, segment } = detail
    return {
      accessType,
      datasourceType,
      datasourceId,
      datasourceDb,
      segment,
    }
  }
  return {}
}

// 根据接口详情及存储的form信息 赋值当前步骤的基础数据

export const getStepBasic = (step: number, forms: any, detail?: any) => {
  if (step === 2) {
    return {
      name: forms[0]?.name,
      path: forms[0]?.path,
      params: forms[0]?.params,
      segment: forms[1]?.segment,
      datasourceId: forms[1]?.datasourceId,
    }
  }
  return {}
}
