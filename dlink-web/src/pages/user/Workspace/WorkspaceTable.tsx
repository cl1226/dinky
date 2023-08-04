import React, { useEffect, useState } from 'react'
import { Button, Col, Space, Input, Tag, Modal, Row, Table, Form, Select } from 'antd'
import styles from './index.less'
import { getWorkspaceList, createWorkspace, deleteWorkspace } from '@/pages/user/service'
import { getStorageClusterId } from '@/components/Common/crud'
import { getBindUserList } from '@/pages/SuperAdmin/service'

const formLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
}

const UserTable = (props) => {
  const { value, onChange } = props
  const [form] = Form.useForm()
  const [modalVisible, setModalVisible] = useState(false)
  const [selectUser, setSelectUser] = useState<any>(null)
  const [userOptions, setUserOptions] = useState<any>([])

  const initOptions = async () => {
    const userList = await getBindUserList({ clusterId: getStorageClusterId() })
    setUserOptions(
      userList.map((item) => ({
        label: `${item.username} ${item.nickname}`,
        value: item.userId,
        username: item.username,
        nickname: item.nickname,
        roleList: item.roleList,
        id: item.userId,
      })),
    )
  }

  const handleCreate = () => {
    setModalVisible(true)
    setSelectUser(null)
    form.resetFields()
  }

  const hanldeConfirm = async () => {
    await form.validateFields()

    onChange && onChange([...(value || []), selectUser])
    setModalVisible(false)
  }
  const handleDelete = async (record) => {
    Modal.confirm({
      content: '确定删除该用户吗？',
      onOk: async () => {
        const filterData = value.filter((item) => item.id !== record.id)
        onChange && onChange(filterData)
      },
    })
  }

  useEffect(() => {
    initOptions()
  }, [])
  const columns = [
    {
      title: '用户',
      dataIndex: 'username',
      key: 'username',
      width: 200,
    },
    {
      title: '用户名',
      dataIndex: 'nickname',
      key: 'nickname',
      width: 180,
    },
    {
      title: '角色',
      dataIndex: 'roleList',
      key: 'roleList',
      width: 180,
      render: (roleList, record) => (
        <Space>
          {roleList.map((item) => (
            <Tag>{item.roleName}</Tag>
          ))}
        </Space>
      ),
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

  return (
    <>
      <Row justify={'space-between'} style={{ marginBottom: 10 }}>
        <Button onClick={() => handleCreate()}>添加</Button>
      </Row>
      <Table
        size={'small'}
        rowKey={'id'}
        columns={columns}
        dataSource={value || []}
        pagination={{
          pageSize: 5,
        }}
      />

      <Modal
        width={500}
        bodyStyle={{ padding: '20px' }}
        destroyOnClose
        title={'绑定用户'}
        open={modalVisible}
        onOk={() => hanldeConfirm()}
        onCancel={() => setModalVisible(false)}
      >
        <Form {...formLayout} form={form}>
          <Form.Item
            name="userId"
            label="用户"
            rules={[{ required: true, message: '请选择用户！' }]}
          >
            <Select
              onChange={(value, option) => {
                setSelectUser(option)
              }}
              showSearch
              optionFilterProp="label"
              placeholder="请选择"
              allowClear={true}
              options={userOptions}
            ></Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
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
    const extraObj: any = {}
    if (form.getFieldValue('id')) {
      extraObj.id = form.getFieldValue('id')
    }
    const result = await createWorkspace({
      clusterId: getStorageClusterId(),
      ...formVal,
      ...extraObj,
    })
    if (result) {
      setModalVisible(false)
      form.resetFields()
      getDataSource()
    }
  }
  const onEditSpace = async (record) => {
    setModalVisible(true)
    form.setFieldsValue({
      id: record.id,
      name: record.name,
      code: record.code,
      obsPath: record.obsPath,
      description: record.description,
      users: record.users,
    })
  }
  const onDelete = async (record) => {
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
          <a onClick={() => onEditSpace(record)}>编辑</a>
          <a onClick={() => onDelete(record)}>删除</a>
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
        width={800}
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
            <Input style={{ width: 350 }} placeholder="请输入工作空间名称" />
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
            <Input style={{ width: 350 }} placeholder="请输入工作空间编号" />
          </Form.Item>
          <Form.Item name="obsPath" label="obs路径">
            <Input style={{ width: 350 }} placeholder="请输入obs路径" />
          </Form.Item>

          <Form.Item label="描述" name="description">
            <Input.TextArea
              placeholder="请输入"
              style={{ width: '100%', resize: 'none' }}
              rows={3}
            ></Input.TextArea>
          </Form.Item>
          <Form.Item label="用户" name="users">
            <UserTable></UserTable>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
