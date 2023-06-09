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
import { Button, Card, Col, Form, Row, Input, Popconfirm, Table, Space, Tooltip } from 'antd'
import type { ColumnsType } from 'antd/es/table'

import { history } from 'umi'
import type {
  IGetApiConfigListParams} from '@/pages/DataAsset/MetaDataManage/TaskManage/service';
import {
  getApiConfigList,
  deleteApiConfig,
  updateApiConfigStatus,
} from '@/pages/DataAsset/MetaDataManage/TaskManage/service'
import type { TreeDataNode } from '@/components/Scheduler/SchedulerTree/Function'
import { Scrollbars } from 'react-custom-scrollbars'
import { debounce } from 'lodash'
import { EAccessType } from '@/utils/enum'

const { Search } = Input

export type IApiListProps = {
  catalogue: TreeDataNode | undefined
  mode: 'catalogue' | 'management'
  tableProps?: {}
}

export interface DataType {
  id: number
  name: string
  path: string
  updateTime: string
  status: number
}

export enum EDebugStatus {
  '失败',
  '成功',
}

export default (props: IApiListProps) => {
  const sref: any = React.createRef<Scrollbars>()
  const [searchKey, setSearchKey] = useState('')
  const [pageNum, setPageNum] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [pageTotal, setPageTotal] = useState(0)

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [loading, setLoading] = useState(false)
  const [apiData, setApiData] = useState([])
  const { catalogue, mode, tableProps = {} } = props

  const getApiList = async (extra?: IGetApiConfigListParams) => {
    if (!catalogue?.id && !extra?.catalogueId && mode === 'catalogue') return

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

  const pageJump = (type, record) => {
    sessionStorage.setItem(
      'dataService.devApi.catalogue.list',
      JSON.stringify({
        pageIndex: pageNum,
        pageSize: pageSize,
        name: searchKey,
        catalogueId: catalogue?.id,
      }),
    )
    history.push(`/dataService/devApi/${type}/${record.id}`)
  }

  useEffect(() => {
    if ((catalogue && catalogue.id) || mode === 'management') {
      const sessionJson = sessionStorage.getItem('dataService.devApi.catalogue.list')
      const sessionQuery = JSON.parse(sessionJson || '{}')
      getApiList(sessionQuery)
      sessionStorage.removeItem('dataService.devApi.catalogue.list')
    }
  }, [catalogue])

  const columnsMaps = {
    catalogue: [
      {
        title: '路径',
        dataIndex: 'path',
        key: 'path',
        width: 200,
      },
      {
        title: '修改时间',
        dataIndex: 'updateTime',
        key: 'updateTime',
        width: 200,
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 150,
        render: (cellValue, record) => {
          return <span>{cellValue === 1 ? '已上线' : '已创建'}</span>
        },
      },
    ],
    management: [
      {
        title: '描述',
        dataIndex: 'description',
        key: 'description',
        width: 200,
        ellipsis: true,
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 120,
        render: (cellValue, record) => {
          return <span>{cellValue === 1 ? '已上线' : '已创建'}</span>
        },
      },
      {
        title: '调试状态',
        dataIndex: 'debugStatus',
        key: 'debugStatus',
        width: 120,
        render: (cellValue, record) => EDebugStatus[cellValue] || '-',
      },
      {
        title: '类型',
        dataIndex: 'accessType',
        key: 'accessType',
        width: 150,
        render: (cellValue, record) => EAccessType[cellValue],
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        key: 'createTime',
        width: 200,
      },
    ],
  }
  const columns: ColumnsType<DataType> = [
    {
      title: 'API名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
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
    ...columnsMaps[mode],
    {
      title: '操作',
      width: 300,
      key: 'action',
      render: (cellValue, record) => (
        <Space size="middle">
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

          <Tooltip title={'调试'}>
            <Button
              size="small"
              type="text"
              onClick={() => {
                pageJump('debug', record)
              }}
              icon={<BugOutlined />}
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
    <div className={[styles['api-list'], styles[mode]].join(' ')}>
      <Scrollbars style={{ height: `100%` }} ref={sref}>
        <div style={{ padding: 10 }}>
          <Row justify={'space-between'}>
            <div className="action-col">
              <Space>
                <Button
                  onClick={() => {
                    history.push('/dataAsset/metaDataManage/create')
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
                <div className="condition-label">最近运行时间</div>
                {/* TODO add */}
                {/* <Search
                  placeholder="请输入名称"
                  onSearch={() => {
                    getApiList()
                  }}
                  onChange={debounce(onApiNameChange, 150)}
                  style={{ width: 200 }}
                /> */}
              </div>
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
