import React, { useState, useEffect } from 'react'
import { Button, Form, Input, message, Modal, Select } from 'antd'
import MonacoEditor from 'react-monaco-editor'
import styles from '../index.less'
import { l } from '@/utils/intl'
import { postClientTest } from '@/pages/Dashboard/service'
import { getClusterByUser } from '@/pages/user/service'
import { ClientTableListItem } from '@/pages/Dashboard/data.d'

export type ClusterFormProps = {
  onCancel: (flag?: boolean) => void
  onSubmit: (values: Partial<ClientTableListItem>) => void
  modalVisible: boolean
  values: Partial<ClientTableListItem>
}
const Option = Select.Option

const formLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 13 },
}

const ClusterForm: React.FC<ClusterFormProps> = (props) => {
  const [form] = Form.useForm()
  const [formVals, setFormVals] = useState<Partial<ClientTableListItem>>({
    id: props.values.id,
    name: props.values.name,
    clusterId: props.values.clusterId,
    hostname: props.values.hostname,
    ip: props.values.ip,
    port: props.values.port,
    username: props.values.username,
    password: props.values.password,
    description: props.values.description,
  })
  const [clusterOptions, setClusterOptions] = useState<any>([])
  const [testLoading, setTestLoading] = useState(false)
  const { onSubmit: handleSubmit, onCancel: handleModalVisible, modalVisible } = props

  const submitForm = async () => {
    const fieldsValue = await form.validateFields()

    fieldsValue.id = formVals.id

    setFormVals(fieldsValue)
    handleSubmit(fieldsValue)
  }

  const onModalCancel = () => {
    handleModalVisible(false)
    form.resetFields()
  }
  const onModalTest = async () => {
    const fieldsValue = await form.validateFields()
    setTestLoading(true)
    const result = await postClientTest({
      ip: fieldsValue.ip,
      hostname: fieldsValue.hostname,
      port: fieldsValue.port,
      username: fieldsValue.username,
      password: fieldsValue.password,
      env: fieldsValue.env,
    })
    setTestLoading(false)
    if (result) {
      Modal.success({
        content: '连接成功',
      })
    }
  }
  const renderContent = (formValsPara: Partial<ClientTableListItem>) => {
    return (
      <>
        <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]}>
          <Input placeholder="请输入名称" />
        </Form.Item>

        <Form.Item
          name="clusterId"
          label="所属集群"
          rules={[{ required: true, message: '请选择集群' }]}
        >
          <Select placeholder="请选择集群">
            {clusterOptions.map((item) => (
              <Option value={item.value}>{item.label}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="hostname" label="hostname">
          <Input placeholder="请输入hostname" />
        </Form.Item>

        <Form.Item name="ip" label="ip" rules={[{ required: true, message: '请输入ip' }]}>
          <Input placeholder="请输入ip" />
        </Form.Item>

        <Form.Item name="port" label="端口" rules={[{ required: true, message: '请输入端口' }]}>
          <Input placeholder="请输入端口" />
        </Form.Item>

        <Form.Item
          name="username"
          label="用户名"
          rules={[{ required: true, message: '请输入用户名' }]}
        >
          <Input placeholder="请输入用户名" />
        </Form.Item>
        <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
          <Input.Password placeholder="请输入密码" />
        </Form.Item>

        <Form.Item
          name="env"
          label="环境变量"
          rules={[{ required: true, message: '请输入资源内容' }]}
        >
          <MonacoEditor
            className={styles.editor}
            height="200"
            theme="vs"
            language="java"
            options={{
              automaticLayout: true,
              selectOnLineNumbers: true,
            }}
          />
        </Form.Item>

        <Form.Item name="description" label="描述">
          <Input.TextArea allowClear autoSize={{ minRows: 3, maxRows: 10 }} />
        </Form.Item>
      </>
    )
  }

  const renderFooter = () => {
    return (
      <>
        <Button onClick={() => onModalCancel()}>取消</Button>
        <Button loading={testLoading} onClick={() => onModalTest()}>
          测试
        </Button>

        <Button type="primary" onClick={() => submitForm()}>
          保存
        </Button>
      </>
    )
  }

  const initClusterOptions = async () => {
    const result = await getClusterByUser()

    setClusterOptions(result.map((item) => ({ label: item.name, value: item.id })))
  }

  useEffect(() => {
    initClusterOptions()
  }, [])

  return (
    <Modal
      width={'40%'}
      bodyStyle={{ padding: '32px 20px' }}
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
