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
import { Button, Form, Input, Modal, Select, Switch } from 'antd'

import { ShellTableListItem } from '@/pages/RegistrationCenter/data'

import { RUN_MODE } from '@/components/Studio/conf'
import { l } from '@/utils/intl'

export type ClusterFormProps = {
  onCancel: (flag?: boolean) => void
  onSubmit: (values: Partial<ShellTableListItem>) => void
  modalVisible: boolean
  values: Partial<ShellTableListItem>
}
const Option = Select.Option

const formLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 13 },
}

const ClusterForm: React.FC<ClusterFormProps> = (props) => {
  const [form] = Form.useForm()
  const [formVals, setFormVals] = useState<Partial<ShellTableListItem>>({
    id: props.values.id,
    name: props.values.name,
    hostName: props.values.hostName,
    ip: props.values.ip,
    port: props.values.port,
    username: props.values.username,
    password: props.values.password,
    description: props.values.description,
  })

  const { onSubmit: handleSubmit, onCancel: handleModalVisible, modalVisible } = props

  const submitForm = async () => {
    const fieldsValue = await form.validateFields()

    fieldsValue.id = formVals.id
    if (!fieldsValue.alias || fieldsValue.alias.length == 0) {
      fieldsValue.alias = fieldsValue.name
    }

    setFormVals(fieldsValue)
    handleSubmit(fieldsValue)
  }

  const onModalCancel = () => {
    handleModalVisible(false)
    form.resetFields()
  }

  const renderContent = (formValsPara: Partial<ShellTableListItem>) => {
    return (
      <>
        <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]}>
          <Input placeholder="请输入名称" />
        </Form.Item>

        <Form.Item name="hostName" label="hostName">
          <Input placeholder="请输入hostName" />
        </Form.Item>

        <Form.Item name="ip" label="ip" rules={[{ required: true, message: '请输入ip' }]}>
          <Input placeholder="请输入ip" />
        </Form.Item>

        <Form.Item name="端口" label="port" rules={[{ required: true, message: '请输入端口' }]}>
          <Input placeholder="请输入端口" />
        </Form.Item>

        <Form.Item
          name="用户名"
          label="username"
          rules={[{ required: true, message: '请输入用户名' }]}
        >
          <Input placeholder="请输入用户名" />
        </Form.Item>
        <Form.Item name="密码" label="password" rules={[{ required: true, message: '请输入密码' }]}>
          <Input.Password placeholder="请输入密码" />
        </Form.Item>
        <Form.Item name="描述" label="description">
          <Input.TextArea allowClear autoSize={{ minRows: 3, maxRows: 10 }} />
        </Form.Item>
      </>
    )
  }

  const renderFooter = () => {
    return (
      <>
        <Button onClick={() => onModalCancel()}>取消</Button>
        <Button onClick={() => onModalCancel()}>测试</Button>

        <Button type="primary" onClick={() => submitForm()}>
          保存
        </Button>
      </>
    )
  }

  return (
    <Modal
      width={'40%'}
      bodyStyle={{ padding: '32px 40px 48px' }}
      destroyOnClose
      title={formVals.id ? l('pages.rc.cluster.modify') : l('pages.rc.cluster.create')}
      visible={modalVisible}
      footer={renderFooter()}
      onCancel={() => onModalCancel()}
    >
      <Form {...formLayout} form={form} initialValues={formVals}>
        {renderContent(formVals)}
      </Form>
    </Modal>
  )
}

export default ClusterForm
