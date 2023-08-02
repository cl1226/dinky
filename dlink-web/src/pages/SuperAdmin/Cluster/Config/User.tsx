import React, { useEffect, useRef, useState } from 'react'
import styles from './index.less'
import { Input, Select, Space, Form, Empty, Table, Button, Row, Modal } from 'antd'
import { ITabComProps } from '@/pages/RegistrationCenter/ClusterManage/Hadoop/data.d'
import { debounce } from 'lodash'
import {
  getTenantList,
  deleteTenant,
  addorUpdateTenant,
  getQueueOptions,
} from '@/pages/RegistrationCenter/ClusterManage/service'

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
  const [queueOptions, setQueueOptions] = useState<any>([])
  const getDataSource = async () => {
    const list = await getTenantList({ clusterId: detailInfo })
    setDataSource(list)
  }
  const initQueueOptions = async () => {
    const list = await getQueueOptions({ clusterId: detailInfo })
    setQueueOptions(
      list.map((item) => ({
        label: item.name,
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

    const result = await addorUpdateTenant({
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
        const result = await deleteTenant(record?.id)
        result && getDataSource()
      },
    })
  }
  useEffect(() => {
    mode !== 'create' && initQueueOptions()
  }, [])
  useEffect(() => {
    if (detailInfo && mode !== 'create') {
      getDataSource()
    }
  }, [detailInfo])
  const columns = [
    {
      title: '账号',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '用户ID',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
    },
    {
      title: '角色',
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: 180,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      width: 180,
      render: (_, record) => (
        <Space>
          <a
            onClick={() => {
              setModalVisible(true)
              setCurrentRow(record)
              form.setFieldsValue({
                name: record.name,
                queueId: record.queueId,
                description: record.description,
              })
            }}
          >
            编辑
          </a>
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
            name="queueId"
            label="队列"
            rules={[{ required: true, message: '请选择队列！' }]}
          >
            <Select placeholder="请选择" allowClear={true} options={queueOptions}></Select>
          </Form.Item>

          <Form.Item name="description" label="描述">
            <Input.TextArea
              placeholder="请输入"
              style={{ resize: 'none' }}
              rows={3}
            ></Input.TextArea>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default UserTab
