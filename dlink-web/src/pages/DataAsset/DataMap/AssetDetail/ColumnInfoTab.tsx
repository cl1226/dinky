import React, { useCallback, useEffect, useState } from 'react'
import { Row, Descriptions, Col, Table } from 'antd'
import styles from './index.less'

export default (props) => {
  const { basicInfo } = props
  const [pageNum, setPageNum] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [pageTotal, setPageTotal] = useState(0)
  const [tableLoading, setTableLoading] = useState(false)
  const [dataSource, setDataSource] = useState([])

  const getTableInfoList = async (extra?: any) => {
    setTableLoading(true)
    const { list, total, pn, ps } = await getAppBindApiList({
      pageIndex: pageNum,
      pageSize: pageSize,
      ...(extra || {}),
    })

    setDataSource(list)
    setPageTotal(total)
    setPageNum(pn)
    setPageSize(ps)
    setTableLoading(false)
  }

  const columns = [
    {
      title: '列名',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '类型',
      dataIndex: 'authTime',
      key: 'authTime',
      width: 150,
    },
    {
      title: '分区列',
      dataIndex: 'authTime',
      key: 'authTime',
      width: 150,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
  ]

  return (
    <div className={styles['detail-tab-wrap']}>
      <Table
        loading={tableLoading}
        rowKey="id"
        size="small"
        columns={columns}
        dataSource={dataSource}
        pagination={{
          current: pageNum,
          pageSize: pageSize,
          size: 'small',
          onChange: (pn, ps) => {
            getTableInfoList({
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
    </div>
  )
}
