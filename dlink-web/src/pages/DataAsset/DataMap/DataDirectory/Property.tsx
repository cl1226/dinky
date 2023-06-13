import React, { useState, useEffect, useRef } from 'react'
import styles from './index.less'
import { Row, Checkbox, Table, Button, Space, Popconfirm } from 'antd'
import type { CheckboxChangeEvent } from 'antd/es/checkbox'
import { connect } from 'umi'
import { getDataDirectoryList } from '@/pages/DataAsset/DataMap/service'
const columns = [
  {
    dataIndex: 'name',
    key: 'name',
    width: 150,
    render: (text, record) => {
      return (
        <>
          <div style={{ width: 40, height: 40, margin: '0 auto', background: '#ccc' }}></div>
          <div style={{ textAlign: 'center' }}>hive_column</div>
        </>
      )
    },
  },
  {
    dataIndex: 'description',
    key: 'description',
    width: 250,
    render: (text, record) => {
      return (
        <>
          <a>bukrs_vf</a>
          <div>/db_dev_ods/ods_sap_vbak_full</div>
        </>
      )
    },
  },
  {
    dataIndex: 'createTime',
    key: 'createTime',
    width: 200,
    render: (text, record) => {
      return (
        <Row justify={'start'}>
          <span style={{ marginRight: 20 }}>创建时间</span>
          <span>-</span>
        </Row>
      )
    },
  },
  {
    key: 'place',
  },
]

const getExpandDetail = (record) => {
  return <p style={{ margin: 0 }}>{2222}</p>
}
const Property = (props) => {
  const { filterForm } = props
  const [loading, setLoading] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [dataSource, setDataSource] = useState([{}])
  const [pageNum, setPageNum] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [pageTotal, setPageTotal] = useState(0)

  const getDataSourceList = async (extra?: any) => {
    const params = {
      pageIndex: pageNum,
      pageSize: pageSize,
      ...(extra || {}),
    }

    setLoading(true)
    const { list, total, pn, ps } = await getDataDirectoryList(params)
    setLoading(false)
    setDataSource(list)
    setPageTotal(total)
    setPageNum(pn)
    setPageSize(ps)
  }

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys)
  }
  const onSelectAllChange = (e: CheckboxChangeEvent) => {
    console.log(`checked = ${e.target.checked}`)
  }
  useEffect(() => {
    console.log('filterForm', filterForm)
    getDataSourceList({
      pageIndex: 1,
      pageSize: 10,
      itemType: filterForm?.itemType?.[0] || '',
      datasourceType: filterForm?.datasourceType || [],
    })
  }, [filterForm])
  return (
    <div className={styles['property-wrap']}>
      <Row justify={'space-between'}>
        <Space>
          <Checkbox onChange={onSelectAllChange}>全选/反选</Checkbox>

          <Popconfirm
            title="请确认将执行删除操作！"
            placement="bottom"
            disabled={!selectedRowKeys.length}
            onConfirm={() => {}}
          >
            <Button size={'small'} disabled={!selectedRowKeys.length}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      </Row>
      <Table
        style={{ marginTop: 10 }}
        loading={loading}
        rowKey="id"
        size="small"
        showHeader={false}
        rowSelection={{
          selectedRowKeys,
          onChange: onSelectChange,
        }}
        columns={columns}
        expandable={{
          expandedRowRender: (record) => getExpandDetail(record),
        }}
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
    </div>
  )
}

export default connect(({ DataDirectory }) => ({
  filterForm: DataDirectory.filterForm,
}))(Property)
