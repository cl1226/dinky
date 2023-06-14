import React, { useEffect, useState } from 'react'
import styles from './index.less'
import { Table } from 'antd'
import { connect } from 'umi'

const ColumnInfoTab = (props) => {
  const { basicInfo } = props

  const columns = [
    {
      title: '列名',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text, record) => (
        <a
          onClick={() => {
            props.dispatch({
              type: 'AssetDetail/openTab',
              payload: {
                itemType: 'Column',
                id: record.id,
              },
            })
          }}
        >
          {text}
        </a>
      ),
    },
    {
      title: '类型',
      dataIndex: 'columnType',
      key: 'columnType',
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
        rowKey="id"
        size="small"
        columns={columns}
        dataSource={basicInfo.metadataColumnDTOS || []}
        pagination={{
          showTotal: (total) => `共 ${total} 条`,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
      />
    </div>
  )
}

export default connect(() => ({}))(ColumnInfoTab)
