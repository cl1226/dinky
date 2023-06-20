import React, { useEffect, useRef, useState } from 'react'
import styles from './index.less'
import { PageContainer } from '@ant-design/pro-layout'
import { SyncOutlined, EditOutlined } from '@ant-design/icons'
import { Button, Card, Col, Form, Row, Input, Popconfirm, Table, Space, Tooltip } from 'antd'
import { Scrollbars } from 'react-custom-scrollbars'
import { debounce } from 'lodash'
import type { ColumnsType } from 'antd/es/table'
import { history } from 'umi'
import moment from 'moment'

import UpdateAppForm from '@/pages/DataService/Application/components/UpdateAppForm'
import {
  getApplicationList,
  handleAddOrUpdateApp,
  deleteApp,
} from '@/pages/DataService/Application/service'
import { ETokenExpire } from '@/utils/enum'
import { AppDataItem } from '@/pages/DataService/Application/data.d'
const { Search } = Input

const Application: React.FC<{}> = (props: any) => {
  const sref: any = React.createRef<Scrollbars>()
  const [appModalVisible, setAppModalVisible] = useState<boolean>(false)
  const [isCreateApp, setIsCreateApp] = useState<boolean>(true)
  const [appFormValues, setAppFormValues] = useState({})

  const [searchKey, setSearchKey] = useState('')
  const [pageNum, setPageNum] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [pageTotal, setPageTotal] = useState(0)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [loading, setLoading] = useState(false)
  const [appData, setAppData] = useState([])

  useEffect(() => {
    const sessionJson = sessionStorage.getItem('dataService.application.list')
    const sessionQuery = JSON.parse(sessionJson || '{}')
    getAppList(sessionQuery)
    sessionStorage.removeItem('dataService.application.list')
  }, [])

  const getAppList = async (extra?: any) => {
    const params = {
      pageIndex: pageNum,
      pageSize: pageSize,
      name: searchKey,
      ...(extra || {}),
    }

    setLoading(true)
    const { list, total, pn, ps } = await getApplicationList(params)
    setLoading(false)
    setAppData(list)
    setPageTotal(total)
    setPageNum(pn)
    setPageSize(ps)
  }

  const pageJump = (type, record) => {
    sessionStorage.setItem(
      'dataService.application.list',
      JSON.stringify({
        pageIndex: pageNum,
        pageSize: pageSize,
        name: searchKey,
      }),
    )
    history.push(`/dataService/application/detail/${record.id}`)
  }

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys)
  }

  const onSearchKeyChange = (e) => {
    setSearchKey(e.target.value)
  }

  const onDelete = async (selections) => {
    if (loading) return
    setLoading(true)
    const result = await deleteApp(selections)
    setLoading(false)
    if (result) {
      getAppList()
    }
  }

  const columns: ColumnsType<AppDataItem> = [
    {
      title: 'APP名称',
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
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 200,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 200,
      render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: 'Token过期时间',
      dataIndex: 'expireDesc',
      key: 'expireDesc',
      width: 200,
      render: (cellValue, record) => ETokenExpire[cellValue] || '-',
    },

    {
      title: '操作',
      width: 150,
      key: 'action',
      render: (cellValue, record) => (
        <Space size="middle">
          <Tooltip title={'编辑'}>
            <Button
              onClick={() => {
                setAppModalVisible(true)
                setIsCreateApp(false)
                setAppFormValues({
                  id: record.id,
                  name: record.name,
                  secret: record.secret,
                  description: record.description,
                  expireDesc: record.expireDesc,
                })
              }}
              size="small"
              type="text"
              icon={<EditOutlined />}
            ></Button>
          </Tooltip>
        </Space>
      ),
    },
  ]
  return (
    <PageContainer title={false}>
      <Scrollbars
        style={{ background: '#fff', height: 'calc(100vh - 48px - 50px - 48px)' }}
        ref={sref}
      >
        <div className={styles.application}>
          <Row justify={'space-between'}>
            <div className="action-col">
              <Space>
                <Button
                  onClick={() => {
                    setIsCreateApp(true)
                    setAppModalVisible(true)
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
                <div className="condition-label">应用名称</div>
                <Search
                  placeholder="请输入关键字"
                  onSearch={() => {
                    getAppList()
                  }}
                  onChange={debounce(onSearchKeyChange, 150)}
                  style={{ width: 200 }}
                />
              </div>
              <Button
                onClick={() => {
                  getAppList()
                }}
                icon={<SyncOutlined />}
              />
            </div>
          </Row>

          <Table
            style={{ marginTop: 10 }}
            loading={loading}
            rowKey="id"
            size="small"
            rowSelection={{
              selectedRowKeys,
              onChange: onSelectChange,
            }}
            columns={columns}
            dataSource={appData}
            pagination={{
              current: pageNum,
              pageSize: pageSize,
              size: 'small',
              onChange: (pn, ps) => {
                getAppList({
                  pageIndex: pn,
                  pageSize: ps,
                })
              },
              total: pageTotal,
              showTotal: (total) => `共 ${total} 条`,
              showSizeChanger: true,
              showQuickJumper: true,
            }}
          />

          {appModalVisible ? (
            <UpdateAppForm
              onSubmit={async (value) => {
                const success = await handleAddOrUpdateApp(value)
                if (success) {
                  setAppModalVisible(false)
                  setAppFormValues({})
                  getAppList()
                }
              }}
              onCancel={() => {
                setAppModalVisible(false)
                setAppFormValues({})
              }}
              updateModalVisible={appModalVisible}
              values={appFormValues}
              isCreate={isCreateApp}
            />
          ) : null}
        </div>
      </Scrollbars>
    </PageContainer>
  )
}

export default Application
