import React, { useEffect, useState } from 'react'
import { Button, Col, Space, Input, Popconfirm, Modal, Row, Table, Form } from 'antd'
import styles from './index.less'
import { getWorkspaceList, createWorkspace, deleteWorkspace } from '@/pages/user/service'
import { getStorageClusterId } from '@/components/Common/crud'

const formLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
}

export default () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const getDataSource = async (extra?: any) => {
    setLoading(true)
    const list = await getWorkspaceList(getStorageClusterId())
    setLoading(false)
    setDataSource(list)
  }
  const onAddWorkspace = () => {
    form.resetFields()
    setModalVisible(true)
  }
  const onModalConfirm = async () => {
    const formVal = await form.validateFields()
    const result = await createWorkspace({
      clusterId: getStorageClusterId(),
      ...formVal,
    })
    if (result) {
      setModalVisible(false)
      form.resetFields()
      getDataSource()
    }
  }

  const handleDelete = async (record) => {
    Modal.confirm({
      content: '确定删除该用户吗？',
      onOk: async () => {
        const result = await deleteWorkspace(record?.id)
        result && getDataSource()
      },
    })
  }

  const columns = [
    {
      title: '工作空间',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '工作空间编码',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'obs路径',
      dataIndex: 'obsPath',
      key: 'obsPath',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
    },

    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      width: 180,
      render: (_, record) => (
        <Space>
          <a onClick={() => handleDelete(record)}>删除</a>
        </Space>
      ),
    },
  ]

  useEffect(() => {
    getDataSource()
  }, [])
  return (
    <>
      <Row style={{ marginBottom: 10 }}>
        <Button onClick={onAddWorkspace}>新建</Button>
      </Row>
      <Table
        className={styles['workspace-table']}
        loading={loading}
        rowKey="id"
        size="small"
        columns={columns}
        dataSource={dataSource}
        pagination={false}
      />

      <Modal
        width={500}
        bodyStyle={{ padding: '32px 40px 48px' }}
        destroyOnClose
        title={'工作空间'}
        open={modalVisible}
        maskClosable={false}
        onOk={() => onModalConfirm()}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} {...formLayout}>
          <Form.Item
            name="name"
            label="名称"
            rules={[
              {
                required: true,
                message: '请输入工作空间名称',
              },
            ]}
          >
            <Input placeholder="请输入工作空间名称" />
          </Form.Item>
          <Form.Item
            name="code"
            label="编码"
            rules={[
              {
                required: true,
                message: '请输入工作空间编号',
              },
            ]}
          >
            <Input placeholder="请输入工作空间编号" />
          </Form.Item>
          <Form.Item name="obsPath" label="obs路径">
            <Input placeholder="请输入obs路径" />
          </Form.Item>

          <Form.Item label="描述" name="description">
            <Input.TextArea
              placeholder="请输入"
              style={{ width: '100%', resize: 'none' }}
              rows={3}
            ></Input.TextArea>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
