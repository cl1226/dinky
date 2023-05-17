import React, { useCallback, useEffect, useState } from 'react'
import styles from './index.less'
import {
  SyncOutlined,
  EditOutlined,
  RiseOutlined,
  FallOutlined,
  BugOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import { Button, Card, Col, Form, Row, Input, DatePicker, Table, Space, Tooltip } from 'antd'
import { PageContainer } from '@ant-design/pro-layout'
import DraggleLayout from '@/components/DraggleLayout'
import type { ColumnsType } from 'antd/es/table'

import { connect, history } from 'umi'
import { StateType } from '@/pages/DataService/ApiDev/Catalogue/model'
import { TreeDataNode } from '@/components/Scheduler/SchedulerTree/Function'
import moment from 'moment'

const { Search } = Input
const RangePicker: any = DatePicker.RangePicker

export type IApiListProps = {
  catalogue: TreeDataNode | undefined
  dispatch?: any
}

interface DataType {
  id: React.Key
  name: string
  path: string
  updateTime: string
  status: string
}

const columns: ColumnsType<DataType> = [
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
    width: 300,
  },
  {
    title: '路径',
    dataIndex: 'path',
    key: 'path',
    width: 300,
  },
  {
    title: '修改时间',
    dataIndex: 'updateTime',
    key: 'updateTime',
    width: 150,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
  },
  {
    title: '操作',
    key: 'action',
    render: (_, record) => (
      <Space size="middle">
        <Tooltip title={'编辑'}>
          <Button size="small" type="text" icon={<EditOutlined />}></Button>
        </Tooltip>
        {record.status === '1' ? (
          <Tooltip title={'上线'}>
            <Button size="small" type="text" icon={<RiseOutlined />}></Button>
          </Tooltip>
        ) : (
          <Tooltip title={'下线'}>
            <Button size="small" type="text" icon={<FallOutlined />}></Button>
          </Tooltip>
        )}

        <Tooltip title={'调试'}>
          <Button size="small" type="text" icon={<BugOutlined />}></Button>
        </Tooltip>
        <Tooltip title={'删除'}>
          <Button size="small" type="text" icon={<DeleteOutlined />}></Button>
        </Tooltip>
      </Space>
    ),
  },
]

const ApiList: React.FC<IApiListProps> = (props: IApiListProps) => {
  const [pageNum, setPageNum] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [pageTotal, setPageTotal] = useState(0)

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [loading, setLoading] = useState(false)
  const [apiData, setApiData] = useState([
    {
      id: '1',
      name: '1',
      path: '1',
      updateTime: '1',
      status: '1',
    },
  ])

  const { catalogue } = props
  console.log('ApiList', catalogue)
  const onApiNameSearch = (value) => {
    console.log('value', value)
  }

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    console.log('selectedRowKeys changed: ', newSelectedRowKeys)
    setSelectedRowKeys(newSelectedRowKeys)
  }

  return (
    <div className={styles['api-list']}>
      <Row justify={'space-between'}>
        <div className="action-col">
          <Space>
            <Button
              onClick={() => {
                history.push('/dataService/devApi/create')
              }}
            >
              新建API
            </Button>
            <Button disabled={!selectedRowKeys.length}>删除</Button>
          </Space>
        </div>
        <div className="condition-col">
          <div className="condition-item">
            <div className="condition-label">API名称</div>
            <Search placeholder="请输入名称" onSearch={onApiNameSearch} style={{ width: 200 }} />
          </div>
          <Button icon={<SyncOutlined />} />
        </div>
      </Row>
      <Table
        className={styles['api-table']}
        loading={loading}
        rowKey="id"
        size="small"
        rowSelection={{
          selectedRowKeys,
          onChange: onSelectChange,
        }}
        columns={columns}
        dataSource={apiData}
        pagination={{
          current: pageNum,
          pageSize: pageSize,
          size: 'small',
          onChange: (pn, ps) => {
            setPageNum(pn)
            setPageSize(ps)
          },
          total: pageTotal,
          showTotal: (total) => `共 ${total} 条`,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
      />
    </div>
  )
}

export default connect(({ Catalogue }: { Catalogue: StateType }) => ({}))(ApiList)
