import React, { useEffect, useState } from 'react'
import styles from './index.less'
import { SyncOutlined } from '@ant-design/icons'
import { Button, Row, Input, Table, Space, Badge, Divider, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'

import { getApiConfigList } from './service'
import type { TreeDataNode } from '@/components/Scheduler/SchedulerTree/Function'
import { Scrollbars } from 'react-custom-scrollbars'
import { debounce } from 'lodash'
import moment from 'moment'
import type { IGetListParams } from './service'
import type { ESchedulerType } from '@/components/XFlow/service'
import { ESchedulerTypeMap } from '@/components/XFlow/service'
import { ExecuteTask } from '@/pages/DataAsset/MetaDataManage/TaskManage/service'

const { Search } = Input

export type IApiListProps = {
  catalogue: TreeDataNode | undefined
  tableProps?: {}
}

export enum EDebugStatus {
  '失败',
  '成功',
}

interface ListDataType {
  key: string
  id: number
  name: string
  beginTime: string
  catalogueId: number
  createTime: string
  duration: number
  endTime: string
  scheduleType: ESchedulerType
  taskId: number
  datasourceName: string
  status: 'Success' | 'Failed' | 'Running'
  updateTime: string
}

const RunningStatusConfig = {
  Running: {
    type: 'processing',
    msg: '运行中',
  },
  Success: {
    type: 'success',
    msg: '成功',
  },
  1: {
    type: 'Default',
    msg: '未运行',
  },
  Failed: {
    type: 'error',
    msg: '失败',
  },
}

export default (props: IApiListProps) => {
  const sref: any = React.createRef<Scrollbars>()
  const [searchKey, setSearchKey] = useState('')
  const [pageNum, setPageNum] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [pageTotal, setPageTotal] = useState(0)

  const [loading, setLoading] = useState(false)
  const [starting, setstarting] = useState(false)
  const [listData, setlistData] = useState([])
  const { catalogue, tableProps = {} } = props

  const getList = async (extra?: IGetListParams) => {
    if (!catalogue?.id && !extra?.catalogueId) return

    const params: IGetListParams = {
      pageIndex: pageNum,
      pageSize: pageSize,
      name: searchKey,
      catalogueId: catalogue?.id,
      ...(extra || {}),
    }

    setLoading(true)
    const { list, total, pn, ps } = await getApiConfigList(params)
    setLoading(false)
    setlistData(list)
    setPageTotal(total)
    setPageNum(pn)
    setPageSize(ps)
  }

  const onApiNameChange = (e) => {
    setSearchKey(e.target.value)
  }

  const handleReRun = (record) => {
    if (starting) return
    setstarting(true)
    message.info('任务已提交, 请稍后')
    ExecuteTask(record.taskId)
      .then((res) => {
        setstarting(false)
        if (res.code == 0) {
          message.success(res.msg)
          getList()
        } else {
          message.error(res.msg)
        }
      })
      .catch((err) => {
        setstarting(false)
        message.error(err)
      })
  }
  const handleLog = (record) => {
    console.log('handleLog')
  }

  useEffect(() => {
    if (catalogue && catalogue.id) {
      getList()
    }
  }, [catalogue])

  const columns: ColumnsType<ListDataType> = [
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      width: 150,
    },
    {
      title: '数据源',
      dataIndex: 'datasourceName',
      key: 'datasourceName',
      width: 100,
    },
    {
      title: '实例状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render(value, record, index) {
        const v = value ?? 1
        return <Badge status={RunningStatusConfig[v].type} text={RunningStatusConfig[v].msg} />
      },
    },
    {
      title: '调度方式',
      dataIndex: 'scheduleType',
      key: 'scheduleType',
      width: 80,
      render(value, record, index) {
        return ESchedulerTypeMap[value]
      },
    },
    {
      title: '调度周期',
      width: 80,
      dataIndex: 'cronExpression',
      key: 'cronExpression',
    },
    {
      title: '开始时间',
      width: 140,
      dataIndex: 'beginTime',
      key: 'beginTime',
      render: (value) => value && moment(value).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '结束时间',
      width: 140,
      dataIndex: 'endTime',
      key: 'endTime',
      render: (value) => value && moment(value).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '运行时间(s)',
      dataIndex: 'duration',
      width: 120,
      key: 'duration',
      render(value, record, index) {
        return Math.round(value / 1000)
      },
    },
    {
      title: '操作',
      width: 80,
      key: 'action',
      fixed: 'right',
      render: (cellValue, record) => (
        <Space size={0} split={<Divider type="vertical" style={{ margin: 2 }} />}>
          <Button
            size="small"
            type="link"
            disabled={starting || record.status == 'Running'}
            onClick={() => {
              handleReRun(record)
            }}
          >
            重跑
          </Button>
          {/* <Button
            size="small"
            type="link"
            onClick={() => {
              handleLog(record)
            }}
          >
            日志
          </Button> */}
        </Space>
      ),
    },
  ]
  return (
    <div className={styles['api-list']}>
      <Scrollbars style={{ height: `100%` }} ref={sref}>
        <div style={{ padding: 10 }}>
          <Row justify={'space-between'}>
            <div className="condition-col">
              <div className="condition-item">
                <div className="condition-label">任务名称</div>
                <Search
                  placeholder="请输入名称"
                  onSearch={() => {
                    getList()
                  }}
                  onChange={debounce(onApiNameChange, 150)}
                  style={{ width: 200 }}
                />
              </div>
              <Button
                onClick={() => {
                  getList()
                }}
                icon={<SyncOutlined />}
              />
            </div>
          </Row>
          <Table
            className={styles['api-table']}
            loading={loading}
            rowKey="id"
            scroll={{ x: 1300 }}
            size="small"
            columns={columns}
            dataSource={listData}
            pagination={{
              current: pageNum,
              pageSize: pageSize,
              size: 'small',
              onChange: (pn, ps) => {
                getList({
                  pageIndex: pn,
                  pageSize: ps,
                })
              },
              total: pageTotal,
              showTotal: (total) => `共 ${total} 条`,
              showSizeChanger: true,
              showQuickJumper: true,
            }}
            {...tableProps}
          />
        </div>
      </Scrollbars>
    </div>
  )
}
