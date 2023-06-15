import React, { useEffect, useState } from 'react'
import styles from './index.less'
import { Table } from 'antd'
import { connect } from 'umi'
import { IAssetDetail } from '@/pages/DataAsset/DataMap/type.d'

const TableInfoTab = (props) => {
  const { basicInfo }: { basicInfo: IAssetDetail } = props
  const columns = [
    {
      title: '表名称',
      dataIndex: 'name',
      key: 'name',
      width: 350,
      render: (text, record) => (
        <a
          onClick={() => {
            props.dispatch({
              type: 'DataAssetMap/openTab',
              payload: {
                itemType: 'Table',
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
      title: '表类型',
      dataIndex: 'tableType',
      key: 'tableType',
      width: 200,
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
        dataSource={basicInfo.metadataTableDTOS || []}
        pagination={{
          showTotal: (total) => `共 ${total} 条`,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
      />
    </div>
  )
}

export default connect(() => ({}))(TableInfoTab)
