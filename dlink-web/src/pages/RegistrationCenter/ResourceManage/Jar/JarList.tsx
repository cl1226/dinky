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
  Upload,
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
import { ESchedulerType, ESchedulerTypeMap } from '@/components/XFlow/service'
import Dialog, { DialogType } from './Dialog'

interface ITableTaskItem extends ITaskItem {
  id: number
  runStatus: string | null
  scheduleStatus: string | null
}

const { Search } = Input

export type IListProps = {
  catalogue: TreeDataNode | undefined
  sessionStorageKey: string
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
    msg: '未调度',
  },
  Failed: {
    type: 'error',
    msg: '失败',
  },
}

export default (props: IListProps) => {
  const sref: any = React.createRef<Scrollbars>()
  const [searchKey, setSearchKey] = useState('')
  const [pageNum, setPageNum] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [pageTotal, setPageTotal] = useState(0)

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [loading, setLoading] = useState(false)
  const [listData, setlistData] = useState([])
  const [dialogtype, setdialogtype] = useState<DialogType>(DialogType.create)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
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
    setlistData(list)
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

  const handleDialog = (type: DialogType) => {
    setIsModalOpen(true)
    setdialogtype(type)
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
      fixed: 'left',
      width: 150,
      ellipsis: {
        showTitle: false,
      },
      render: (cellValue, record) => (
        <Tooltip placement="topLeft" title={cellValue}>
          <Button
            type="link"
            onClick={() => {
              pageJump('detail', record)
            }}
          >
            {cellValue}
          </Button>
        </Tooltip>
      ),
    },
    {
      title: '数据源',
      dataIndex: 'datasourceName',
      key: 'datasourceName',
      width: 100,
    },
    {
      title: '数据源类型',
      dataIndex: 'datasourceType',
      key: 'datasourceType',
      width: 100,
    },
    {
      title: '调度类型',
      dataIndex: 'scheduleType',
      key: 'scheduleType',
      width: 100,
      render(value, record, index) {
        return ESchedulerTypeMap[value]
      },
    },
    {
      title: '调度状态',
      dataIndex: 'scheduleStatus',
      key: 'scheduleStatus',
      width: 100,
      render(value, record, index) {
        const v = value ?? 1
        if (record.scheduleType == ESchedulerType.SINGLE) {
          return ''
        }
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
      width: 130,
      key: 'nextRunTime',
      render: (value) => value && moment(value).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      width: 160,
      key: 'action',
      fixed: 'right',
      render: (cellValue, record) => (
        <Space size="middle">
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
                <Button onClick={() => handleDialog(DialogType.create)}>创建文件</Button>
                <Button onClick={() => handleDialog(DialogType.upload)} type="primary">
                  上传文件
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
            scroll={{ x: 1300 }}
            size="small"
            rowSelection={{
              selectedRowKeys,
              onChange: onSelectChange,
            }}
            columns={columns}
            dataSource={listData}
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

          <Dialog type={dialogtype} isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
        </div>
      </Scrollbars>
    </div>
  )
}
