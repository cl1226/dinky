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
  MessageOutlined,
  DownloadOutlined,
  HighlightOutlined,
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
import type { IGetApiConfigListParams } from '../service'
import { getApiConfigList, deleteApiConfig } from '../service'
import type { TreeDataNode } from '@/components/Scheduler/SchedulerTree/Function'
import { Scrollbars } from 'react-custom-scrollbars'
import { debounce } from 'lodash'
import moment from 'moment'
import { downloadBlob } from '@/utils/download'
import Dialog, { DialogType } from './Dialog'

export interface ITableDocumentItem {
  id: number
  catalogueId: number
  description: string
  filePath: string
  createTime: string
  name: string
  type: 'File' | 'Jar'
  updateTime: string
}

const { Search } = Input

export type IListProps = {
  catalogue: TreeDataNode | undefined
  sessionStorageKey: string
  tableProps?: {}
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
  const [dialogtype, setdialogtype] = useState<DialogType>(DialogType.upload)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [editRecord, seteditRecord] = useState<ITableDocumentItem>()
  const { catalogue, tableProps = {}, sessionStorageKey } = props

  const getApiList = async (extra?: IGetApiConfigListParams) => {
    if (!catalogue?.id && !extra?.catalogueId) return

    const params: IGetApiConfigListParams = {
      pageIndex: pageNum,
      pageSize: pageSize,
      name: searchKey,
      catalogueId: catalogue?.id,
      type: 'Jar',
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

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys)
  }

  const handleDialog = (type: DialogType, record?: ITableDocumentItem) => {
    if (record) {
      seteditRecord(record)
    }
    setIsModalOpen(true)
    setdialogtype(type)
  }

  const download = (record: ITableDocumentItem) => {
    const tmpArr = record.filePath.split('/') || []
    const fileName = tmpArr.length === 0 ? record.name : tmpArr[tmpArr.length - 1]
    downloadBlob(`/api/file/manage/downloadFile?id=${record.id}`, fileName)
  }

  const pageJump = (type, record?) => {
    if (loading) {
      return
    }
    sessionStorage.setItem(
      sessionStorageKey,
      JSON.stringify({
        pageIndex: pageNum,
        pageSize: pageSize,
        name: searchKey,
        catalogueId: catalogue?.id,
      }),
    )
    history.push(`/resource/resourcemanage/document/${type}/${record.id}`)
  }

  useEffect(() => {
    if (catalogue && catalogue.id) {
      const sessionJson = sessionStorage.getItem(sessionStorageKey)
      const sessionQuery = JSON.parse(sessionJson || '{}')
      getApiList(sessionQuery)
      sessionStorage.removeItem(sessionStorageKey)
    }
  }, [catalogue])

  const columns: ColumnsType<ITableDocumentItem> = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      ellipsis: {
        showTitle: false,
      },
      // render: (cellValue, record) => (
      //   <Tooltip placement="topLeft" title={cellValue}>
      //     <Button
      //       type="link"
      //       onClick={() => {
      //         pageJump('detail', record)
      //       }}
      //     >
      //       {cellValue}
      //     </Button>
      //   </Tooltip>
      // ),
    },
    {
      title: '文件路径',
      dataIndex: 'filePath',
      key: 'filePath',
      width: 150,
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
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: 100,
      render(value, record, index) {
        return value && moment(value).format('YYYY-MM-DD HH:mm:ss')
      },
    },
    {
      title: '操作',
      width: 100,
      key: 'action',
      fixed: 'right',
      render: (cellValue, record) => (
        <Space size="middle">
          {/* <Tooltip title={'编辑'}>
            <Button
              onClick={() => {
                pageJump('edit', record)
              }}
              size="small"
              type="text"
              icon={<EditOutlined />}
            />
          </Tooltip> */}
          <Tooltip title={'重命名'}>
            <Button
              onClick={() => handleDialog(DialogType.rename, record)}
              size="small"
              type="text"
              icon={<HighlightOutlined />}
            />
          </Tooltip>
          <Tooltip title={'下载'}>
            <Button
              onClick={() => {
                download(record)
              }}
              size="small"
              type="text"
              icon={<DownloadOutlined />}
            />
          </Tooltip>
          <Tooltip title={'删除'}>
            <Popconfirm
              title="请确认将执行删除操作！"
              placement="bottom"
              onConfirm={() => {
                onDelete([record.id])
              }}
            >
              <Button size="small" type="text" icon={<DeleteOutlined />} />
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
                  disabled={loading}
                  onClick={() => handleDialog(DialogType.upload)}
                  type="primary"
                >
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
                <div className="condition-label">文件名称</div>
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

          <Dialog
            type={dialogtype}
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            catalogue={catalogue as TreeDataNode}
            onCreateSuccess={getApiList}
            editRecord={editRecord}
          />
        </div>
      </Scrollbars>
    </div>
  )
}
