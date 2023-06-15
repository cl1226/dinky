import React, { useEffect, useState } from 'react'
import styles from './index.less'
import { Table } from 'antd'
import { connect } from 'umi'

const ColumnInfoTab = (props) => {
  const { basicInfo } = props

  const getColumn = (datasourceType) => {
    let extraCol: any = []
    if (datasourceType === 'Mysql' || datasourceType === 'StarRocks') {
      extraCol = [
        {
          title: '长度',
          dataIndex: 'length',
          key: 'length',
          width: 80,
          render: (cellValue) => (cellValue ? cellValue : '0'),
        },
        {
          title: '精度',
          dataIndex: 'precisionLength',
          key: 'precisionLength',
          width: 80,
          render: (cellValue) => (cellValue ? cellValue : ''),
        },
        {
          title: '主键',
          dataIndex: 'keyFlag',
          key: 'keyFlag',
          width: 80,
          render: (cellValue) => (cellValue ? '是' : '否'),
        },

        {
          title: '可空',
          dataIndex: 'nullable',
          key: 'nullable',
          width: 80,
          render: (cellValue) => (cellValue ? '是' : '否'),
        },

        {
          title: '自增',
          dataIndex: 'autoIncrement',
          key: 'autoIncrement',
          width: 80,
          render: (cellValue) => (cellValue ? '是' : '否'),
        },
        {
          title: '字符集',
          dataIndex: 'characterSet',
          key: 'characterSet',
          width: 120,
        },
        {
          title: '默认值',
          dataIndex: 'defaultValue',
          key: 'defaultValue',
          width: 150,
          render: (cellValue) => (cellValue ? cellValue : ''),
        },
      ]
    } else {
      extraCol.push({
        title: '分区列',
        dataIndex: 'partitionFlag',
        key: 'partitionFlag',
        width: 120,
        render: (cellValue) => (cellValue ? '是' : '否'),
      })
    }
    return [
      {
        title: '列名',
        dataIndex: 'name',
        key: 'name',
        width: 200,
        render: (text, record) => (
          <a
            onClick={() => {
              props.dispatch({
                type: 'DataAssetMap/openTab',
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
        width: 120,
      },
      ...extraCol,
      {
        title: '描述',
        dataIndex: 'description',
        key: 'description',
      },
    ]
  }

  return (
    <div className={styles['detail-tab-wrap']}>
      <Table
        rowKey="id"
        size="small"
        columns={getColumn(basicInfo.datasourceType)}
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
