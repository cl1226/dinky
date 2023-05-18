import React, { useCallback, useEffect, useState, useRef } from 'react'
import styles from './index.less'
import { Card, Button, Steps, Form, Input, Select } from 'antd'
import type { FormInstance } from 'antd/es/form'
import { EContentType } from '@/utils/enum'
import { transferEnumToOptions, getEnumLabel } from '@/utils/utils'
import CatalogueSelect from '@/pages/DataService/ApiDev/Create/components/CatalogueSelect'
import Parameters from '@/pages/DataService/ApiDev/Create/components/Parameters'

// reset form fields when modal is form, inActive
export const useResetFormWhenInactive = ({
  form,
  active,
}: {
  form: FormInstance
  active: boolean
}) => {
  const prevActiveRef = useRef<boolean>()
  useEffect(() => {
    prevActiveRef.current = active
  }, [active])
  const prevActive = prevActiveRef.current

  useEffect(() => {
    if (!active && prevActive) {
      form.resetFields()
    }
  }, [form, prevActive, active])
}

export default () => {
  const [form] = Form.useForm()

  return (
    <Form
      name="basic-setting-form"
      labelCol={{ flex: '150px' }}
      labelAlign="left"
      labelWrap
      wrapperCol={{ flex: 1 }}
      colon={false}
    >
      <Form.Item label="API名称" name="apiName" rules={[{ required: true }]}>
        <Input style={{ width: 500 }} />
      </Form.Item>
      <Form.Item label="API目录" name="catalogue" rules={[{ required: true }]}>
        <CatalogueSelect style={{ width: 500 }} />
      </Form.Item>
      <Form.Item label="请求Path" name="path" rules={[{ required: true }]}>
        <Input style={{ width: 500 }} placeholder="请输入请求Path" />
      </Form.Item>
      <Form.Item label="Content-Type" name="contentType" rules={[{ required: true }]}>
        <Select style={{ width: 300 }} options={transferEnumToOptions(EContentType)}></Select>
      </Form.Item>

      <Form.Item label="入参定义" name="params" rules={[{ required: true }]}>
        <Parameters/>
      </Form.Item>
    </Form>
  )
}
