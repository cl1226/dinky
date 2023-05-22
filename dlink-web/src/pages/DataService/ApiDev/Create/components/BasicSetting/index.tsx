import React from 'react'
import styles from './index.less'
import { Form, Input, Select, Radio } from 'antd'
import CatalogueSelect from '@/pages/DataService/ApiDev/Create/components/CatalogueSelect'
import Parameters from '@/pages/DataService/ApiDev/Create/components/Parameters'

import { EContentType, EAuthType } from '@/utils/enum'
import { transferEnumToOptions } from '@/utils/utils'

import { requestCheckPath } from '@/pages/DataService/ApiDev/Create/service'
import { CODE } from '@/components/Common/crud'

export default ({ form, formLayout, forms, mode, detailInfo }) => {
  return (
    <Form
      {...formLayout}
      form={form}
      name="basic-setting-form"
      initialValues={{
        authType: 'none',
      }}
    >
      <Form.Item
        label="API名称"
        name="name"
        rules={[{ required: true, message: '请输入API名称！' }]}
      >
        <Input style={{ width: 500 }} />
      </Form.Item>
      <Form.Item
        label="API目录"
        name="catalogue"
        rules={[{ required: true, message: '请选择API目录！' }]}
      >
        <CatalogueSelect style={{ width: 500 }} />
      </Form.Item>
      <Form.Item
        label="请求Path"
        name="path"
        validateTrigger={['onChange', 'onBlur']}
        rules={[
          { required: true, message: '请输入请求Path！' },
          {
            validateTrigger: 'onBlur',
            validator: async (_, value) => {
              if (mode === 'edit') {
                if (value === detailInfo.path) {
                  return Promise.resolve()
                }
              }
              if (value) {
                const result = await requestCheckPath(value)
                if (result.code === CODE.SUCCESS) {
                  return Promise.resolve()
                } else {
                  return Promise.reject(result.msg || '校验失败')
                }
              } else {
                return Promise.resolve()
              }
            },
          },
        ]}
      >
        <Input style={{ width: 500 }} placeholder="请输入请求Path" />
      </Form.Item>
      <Form.Item
        label="Content-Type"
        name="contentType"
        rules={[{ required: true, message: '请选择Content-Type！' }]}
      >
        <Select style={{ width: 300 }} options={transferEnumToOptions(EContentType)}></Select>
      </Form.Item>

      <Form.Item label="安全认证" name="authType">
        <Radio.Group
          options={transferEnumToOptions(EAuthType)}
          optionType="button"
          buttonStyle="solid"
        />
      </Form.Item>

      <Form.Item label="描述" name="description">
        <Input.TextArea style={{ resize: 'none' }} rows={4}></Input.TextArea>
      </Form.Item>

      <Form.Item label="入参定义" name="params">
        <Parameters />
      </Form.Item>
    </Form>
  )
}
