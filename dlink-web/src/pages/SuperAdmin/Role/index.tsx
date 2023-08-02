import React, { useEffect, useState } from 'react'
import { Button, Col, Space, Input, Popconfirm, Modal, Row, Table, Tree } from 'antd'
import { history } from 'umi'
import styles from './index.less'
import { debounce } from 'lodash'
import {
  SyncOutlined,
  EditOutlined,
  RiseOutlined,
  FallOutlined,
  BugOutlined,
  DeleteOutlined,
} from '@ant-design/icons'

import PageWrap from '@/components/Common/PageWrap'
import { deleteRole, getRoleList } from '@/pages/SuperAdmin/service'
const { Search } = Input

const Role = () => {
  const [searchKey, setSearchKey] = useState('')
  const [pageNum, setPageNum] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [pageTotal, setPageTotal] = useState(0)

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState([])

  const getDataSourceList = async (extra?: any) => {
    const params = {
      pageIndex: pageNum,
      pageSize: pageSize,
      name: searchKey,
      ...(extra || {}),
    }

    setLoading(true)
    const { list, total, pn, ps } = await getRoleList(params)
    setLoading(false)
    setDataSource(list)
    setPageTotal(total)
    setPageNum(pn)
    setPageSize(ps)
  }

  const onDelete = async (selections) => {
    if (loading) return
    setLoading(true)
    const result = await deleteRole(selections)
    setLoading(false)
    if (result) {
      getDataSourceList()
    }
  }
  useEffect(() => {
    getDataSourceList()
  }, [])
  const columns = [
    {
      title: '角色编码',
      dataIndex: 'roleCode',
      key: 'roleCode',
    },
    {
      title: '角色名称',
      dataIndex: 'roleName',
      key: 'roleName',
    },
    {
      title: '备注',
      dataIndex: 'note',
      key: 'note',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
    },
  ]
  return (
    <PageWrap className={styles['role-page']}>
      <Row justify={'space-between'}>
        <div className="action-col">
          {/* <Space>
            <Button onClick={() => {}}>新建角色</Button>

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
          </Space> */}
        </div>
        <div className="condition-col">
          <div className="condition-item">
            <div className="condition-label">角色名称</div>
            <Search
              placeholder="请输入名称"
              onSearch={() => {
                getDataSourceList()
              }}
              onChange={debounce((e) => {
                setSearchKey(e.target.value)
              }, 150)}
              style={{ width: 200 }}
            />
          </div>
          <Button
            onClick={() => {
              getDataSourceList()
            }}
            icon={<SyncOutlined />}
          />
        </div>
      </Row>

      <Table
        className={styles['role-table']}
        loading={loading}
        rowKey="id"
        size="small"
        // rowSelection={{
        //   selectedRowKeys,
        //   onChange: (newSelectedRowKeys: React.Key[]) => {
        //     setSelectedRowKeys(newSelectedRowKeys)
        //   },
        // }}
        columns={columns}
        dataSource={dataSource}
        pagination={{
          current: pageNum,
          pageSize: pageSize,
          size: 'small',
          onChange: (pn, ps) => {
            getDataSourceList({
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
    </PageWrap>
  )
}

export default Role
