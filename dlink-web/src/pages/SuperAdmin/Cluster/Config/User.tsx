import React, { useEffect, useRef, useState } from 'react'
import styles from './index.less'
import { Input, Tag, Select, Space, Form, Empty, Table, Button, Row, Modal } from 'antd'
import { ITabComProps } from '@/pages/RegistrationCenter/ClusterManage/Hadoop/data.d'
import { debounce } from 'lodash'
import {
  getRoleOptions,
  getUserOptions,
  getBindUserList,
  addorUpdateBindUser,
  deleteBindUser,
} from '@/pages/SuperAdmin/service'
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
}

const UserTab: React.FC<ITabComProps> = (props: ITabComProps) => {
  const { mode, detailInfo } = props
  const [form] = Form.useForm()
  const [modalVisible, setModalVisible] = useState(false)
  const [currentRow, setCurrentRow] = useState<any>({})
  const [dataSource, setDataSource] = useState<any>([])
  const [roleOptions, setRoleOptions] = useState<any>([])
  const [userOptions, setUserOptions] = useState<any>([])
  const getDataSource = async () => {
    const list = await getBindUserList({ clusterId: detailInfo })
    setDataSource(list)
  }
  const initOptions = async () => {
    const [roleList, userList] = await Promise.all([getRoleOptions(), getUserOptions()])
    setRoleOptions(
      roleList.map((item) => ({
        label: item.roleName,
        value: item.id,
      })),
    )
    setUserOptions(
      userList.map((item) => ({
        label: `${item.username} ${item.nickname}`,
        value: item.id,
      })),
    )
  }
  const handleCreate = () => {
    setModalVisible(true)
    setCurrentRow({})
    form.resetFields()
  }
  const hanldeConfirm = async () => {
    const formVal = await form.validateFields()

    const result = await addorUpdateBindUser({
      ...currentRow,
      ...formVal,
      clusterId: detailInfo,
    })
    if (result) {
      setModalVisible(false)
      getDataSource()
    }
  }
  const handleDelete = async (record) => {
    Modal.confirm({
      content: '确定删除该用户吗？',
      onOk: async () => {
        const result = await deleteBindUser(record?.id)
        result && getDataSource()
      },
    })
  }
  useEffect(() => {
    mode !== 'create' && initOptions()
  }, [])
  useEffect(() => {
    if (detailInfo && mode !== 'create') {
      getDataSource()
    }
  }, [detailInfo])
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
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
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

  if (mode === 'create') {
    return <Empty description="请在创建完成后，在集群配置中分配用户" />
  }
  return (
    <div className={styles['user-wrap']}>
      <Row justify={'space-between'} style={{ marginBottom: 10 }}>
        <Button onClick={() => handleCreate()}>添加</Button>
      </Row>

      <Table
        size={'small'}
        rowKey={'id'}
        columns={columns}
        dataSource={dataSource}
        pagination={false}
      />
      <Modal
        width={640}
        bodyStyle={{ padding: '32px 40px 48px' }}
        destroyOnClose
        title={'绑定用户'}
        open={modalVisible}
        onOk={() => hanldeConfirm()}
        onCancel={() => setModalVisible(false)}
      >
        <Form {...formLayout} form={form}>
          <Form.Item
            name="userId"
            label="账号"
            rules={[{ required: true, message: '请选择账号！' }]}
          >
            <Select placeholder="请选择" allowClear={true} options={userOptions}></Select>
          </Form.Item>

          <Form.Item
            name="roleId"
            label="角色"
            rules={[{ required: true, message: '请选择角色！' }]}
          >
            <Select placeholder="请选择" allowClear={true} options={roleOptions}></Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default UserTab
