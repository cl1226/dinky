import React, { useCallback, useEffect, useState } from 'react'
import styles from './index.less'
import {
  SyncOutlined,
  EditOutlined,
  RiseOutlined,
  FallOutlined,
  BugOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons'
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Row,
  Input,
  Popconfirm,
  Table,
  Space,
  Tooltip,
  message,
  Badge,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'

import { history } from 'umi'
import type { IGetApiConfigListParams } from '@/pages/DataAsset/MetaDataManage/TaskManage/service'
import {
  getApiConfigList,
  deleteApiConfig,
  updateApiConfigStatus,
  ExecuteTask,
} from '@/pages/DataAsset/MetaDataManage/TaskManage/service'
import type { TreeDataNode } from '@/components/Scheduler/SchedulerTree/Function'
import { Scrollbars } from 'react-custom-scrollbars'
import { debounce } from 'lodash'
import moment from 'moment'
import type { ITaskItem } from '../../../Create/index.d'

interface ITableTaskItem extends ITaskItem {
  id: number
  runStatus: string | null
  scheduleStatus: string | null
}

const { Search } = Input

export type IApiListProps = {
  catalogue: TreeDataNode | undefined
  tableProps?: {}
}

export enum EDebugStatus {
  '失败',
  '成功',
}

const RunningStatusConfig = {
  Success: {
    type: 'success',
    msg: '成功',
  },
  1: {
    type: 'processing',
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

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [loading, setLoading] = useState(false)
  const [starting, setstarting] = useState(false)
  const [apiData, setApiData] = useState([])
  const { catalogue, tableProps = {} } = props

  const getApiList = async (extra?: IGetApiConfigListParams) => {
    if (!catalogue?.id && !extra?.catalogueId) return

    const params: IGetApiConfigListParams = {
      pageIndex: pageNum,
      pageSize: pageSize,
      name: searchKey,
      catalogueId: catalogue?.id,
      ...(extra || {}),
    }

    setLoading(true)
    const { list, total, pn, ps } = await getApiConfigList(params)
    setLoading(false)
    setApiData(list)
    setPageTotal(total)
    setPageNum(pn)
    setPageSize(ps)
  }

  const onApiNameChange = (e) => {
    setSearchKey(e.target.value)
  }
  const onDelete = async (selections) => {
    if (loading) return
    setLoading(true)
    const result = await deleteApiConfig(selections)
    setLoading(false)
    if (result) {
      getApiList()
    }
  }
  const onUpdateApiStatus = async (id: number, mode: 'offline' | 'online') => {
    if (loading) return
    setLoading(true)
    const result = await updateApiConfigStatus(id, mode)
    setLoading(false)
    if (result) {
      getApiList()
    }
  }
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys)
  }

  const handleStart = (record) => {
    if (starting) return
    setstarting(true)
    message.info('任务已提交, 请稍后')
    ExecuteTask(record.id)
      .then((res) => {
        setstarting(false)
        if (res.code == 0) {
          message.success(res.msg)
          getApiList()
        } else {
          message.error(res.msg)
        }
      })
      .catch((err) => {
        setstarting(false)
        message.error(err)
      })
  }

  const pageJump = (type, record?) => {
    if (loading) {
      return
    }
    sessionStorage.setItem(
      'dataAsset.metaDataManage.taskManage.list',
      JSON.stringify({
        pageIndex: pageNum,
        pageSize: pageSize,
        name: searchKey,
        catalogueId: catalogue?.id,
      }),
    )
    if (type == 'edit') {
      history.push(`/dataAsset/metaDataManage/create?id=${record.id}`)
    } else if (record) {
      history.push(`/dataAsset/metaDataManage/${type}/${record.id}`)
    } else {
      history.push(`/dataAsset/metaDataManage/${type}`)
    }
  }

  useEffect(() => {
    if (catalogue && catalogue.id) {
      const sessionJson = sessionStorage.getItem('dataAsset.metaDataManage.taskManage.list')
      const sessionQuery = JSON.parse(sessionJson || '{}')
      getApiList(sessionQuery)
      sessionStorage.removeItem('dataAsset.metaDataManage.taskManage.list')
    }
  }, [catalogue])

  const columns: ColumnsType<ITableTaskItem> = [
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (cellValue, record) => (
        <Button
          type="link"
          onClick={() => {
            pageJump('detail', record)
          }}
        >
          {cellValue}
        </Button>
      ),
    },
    {
      title: '数据源类型',
      dataIndex: 'datasourceType',
      key: 'datasourceType',
      width: 100,
    },
    {
      title: '调度状态',
      dataIndex: 'scheduleStatus',
      key: 'scheduleStatus',
      width: 100,
      render(value, record, index) {
        const v = value ?? 1
        return <Badge status={RunningStatusConfig[v].type} text={RunningStatusConfig[v].msg} />
      },
    },
    {
      title: '调度周期',
      width: 100,
      dataIndex: 'cronExpression',
      key: 'cronExpression',
    },
    {
      title: '描述',
      width: 150,
      dataIndex: 'description',
      key: 'description',
      ellipsis: {
        showTitle: false,
      },
      render: (value, record, index) => (
        <Tooltip placement="topLeft" title={value}>
          {value}
        </Tooltip>
      ),
    },
    {
      title: '下次运行时间',
      dataIndex: 'nextRunTime',
      width: 120,
      key: 'nextRunTime',
      render: (value) => value && moment(value).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      width: 160,
      key: 'action',
      render: (cellValue, record) => (
        <Space size="middle">
          <Tooltip title={'运行'}>
            <Button
              size="small"
              type="text"
              disabled={record.status == 0 || record.runStatus == 'Running' || starting}
              onClick={() => {
                handleStart(record)
              }}
              icon={<PlayCircleOutlined />}
            />
          </Tooltip>
          {record.status === 1 ? (
            <Tooltip title={'下线'}>
              <Popconfirm
                title="请确认将执行下线操作！"
                placement="bottom"
                onConfirm={() => {
                  onUpdateApiStatus(record.id, 'offline')
                }}
              >
                <Button size="small" type="text" icon={<FallOutlined />} />
              </Popconfirm>
            </Tooltip>
          ) : (
            <Tooltip title={'上线'}>
              <Popconfirm
                title="请确认将执行上线操作"
                placement="bottom"
                onConfirm={() => {
                  onUpdateApiStatus(record.id, 'online')
                }}
              >
                <Button size="small" type="text" icon={<RiseOutlined />} />
              </Popconfirm>
            </Tooltip>
          )}
          <Tooltip title={'编辑'}>
            <Button
              onClick={() => {
                pageJump('edit', record)
              }}
              size="small"
              disabled={record.status === 1}
              type="text"
              icon={<EditOutlined />}
            />
          </Tooltip>
          <Tooltip title={'删除'}>
            <Popconfirm
              title="请确认将执行删除操作！"
              placement="bottom"
              disabled={record.status === 1}
              onConfirm={() => {
                onDelete([record.id])
              }}
            >
              <Button
                size="small"
                type="text"
                disabled={record.status === 1}
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ]
  return (
    <div className={styles['api-list']}>
      <Scrollbars style={{ height: `100%` }} ref={sref}>
        <div style={{ padding: 10 }}>
          <Row justify={'space-between'}>
            <div className="action-col">
              <Space>
                <Button
                  onClick={() => {
                    pageJump('create')
                  }}
                >
                  新建
                </Button>

                <Popconfirm
                  title="请确认将执行删除操作！"
                  placement="bottom"
                  disabled={!selectedRowKeys.length}
                  onConfirm={() => {
                    onDelete(selectedRowKeys)
                  }}
                >
                  <Button disabled={!selectedRowKeys.length}>删除</Button>
                </Popconfirm>
              </Space>
            </div>
            <div className="condition-col">
              <div className="condition-item">
                <div className="condition-label">任务名称</div>
                <Search
                  placeholder="请输入名称"
                  onSearch={() => {
                    getApiList()
                  }}
                  onChange={debounce(onApiNameChange, 150)}
                  style={{ width: 200 }}
                />
              </div>
              <Button
                onClick={() => {
                  getApiList()
                }}
                icon={<SyncOutlined />}
              />
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
                getApiList({
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
