/*
 *
 *  Licensed to the Apache Software Foundation (ASF) under one or more
 *  contributor license agreements.  See the NOTICE file distributed with
 *  this work for additional information regarding copyright ownership.
 *  The ASF licenses this file to You under the Apache License, Version 2.0
 *  (the "License"); you may not use this file except in compliance with
 *  the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

import React, { useState } from 'react'
import { Button, Form, Input, Modal, Select } from 'antd'

import type { TaskTableListItem } from '../data.d'
import { EJobType } from '../data.d'

import { l } from '@/utils/intl'
import { transferEnumToOptions } from '@/utils/utils'

export type UpdateFormProps = {
  onCancel: (flag?: boolean, formVals?: Partial<TaskTableListItem>) => void
  onSubmit: (values: Partial<TaskTableListItem>) => void
  updateModalVisible: boolean
  isCreate: boolean
  values: Partial<TaskTableListItem>
}

const formLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 13 },
}

const SimpleTaskForm: React.FC<UpdateFormProps> = (props) => {
  const [formVals, setFormVals] = useState<Partial<TaskTableListItem>>({
    id: props.values.id,
    name: props.values.name,
    alias: props.values.alias,
    parentId: props.values.parentId,
    config: props.values.config,
    type: props.values.type,
  })

  const [form] = Form.useForm()

  const {
    onSubmit: handleUpdate,
    onCancel: handleUpdateModalVisible,
    updateModalVisible,
    values,
    isCreate,
  } = props

  const submitForm = async () => {
    const fieldsValue = await form.validateFields()
    const data = { ...formVals, ...fieldsValue }
    try {
      data.config = {
        templateId: String(data['config.templateId'].lastItem),
        className: data['config.className'],
      }
    } catch (e) {}
    setFormVals(data)
    handleUpdate(data)
  }

  const renderContent = () => {
    return (
      <>
        <Form.Item
          name="name"
          label="名称"
          rules={[{ required: true, message: '请输入唯一名称！' }]}
        >
          <Input placeholder="请输入" />
        </Form.Item>
        <Form.Item name="alias" label="别名" rules={[{ required: true, message: '请输入别名！' }]}>
          <Input placeholder="请输入" />
        </Form.Item>

        <Form.Item label="模式" name="type" rules={[{ required: true, message: '请选择模式' }]}>
          <Select
            style={{ width: '100%' }}
            placeholder="请选择读取方式"
            options={transferEnumToOptions(EJobType)}
          />
        </Form.Item>
      </>
    )
  }

  const renderFooter = () => {
    return (
      <>
        <Button onClick={() => handleUpdateModalVisible(false, values)}>
          {l('button.cancel')}
        </Button>
        <Button type="primary" onClick={() => submitForm()}>
          {l('button.finish')}
        </Button>
      </>
    )
  }

  return (
    <Modal
      width={640}
      bodyStyle={{ padding: '32px 40px 48px' }}
      destroyOnClose
      title={isCreate ? '创建新作业' : '重命名作业-' + formVals.name}
      visible={updateModalVisible}
      footer={renderFooter()}
      onCancel={() => handleUpdateModalVisible()}
    >
      <Form
        {...formLayout}
        form={form}
        initialValues={{
          id: formVals.id,
          name: formVals.name,
          alias: formVals.alias,
          parentId: formVals.parentId,
        }}
      >
        {renderContent()}
      </Form>
    </Modal>
  )
}

export default SimpleTaskForm
