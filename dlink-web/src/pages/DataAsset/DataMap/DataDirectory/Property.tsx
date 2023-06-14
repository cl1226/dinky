import React, { useState, useEffect, useRef } from 'react'
import styles from './index.less'
import { Row, Checkbox, Table, Button, Space, Popconfirm, Input, Descriptions } from 'antd'
import type { CheckboxChangeEvent } from 'antd/es/checkbox'
import { connect, history } from 'umi'
import { getDataDirectoryList } from '@/pages/DataAsset/DataMap/service'
import { SyncOutlined } from '@ant-design/icons'
import { debounce } from 'lodash'

const getExpandDetail = (record) => {
  const { datasourceType, attributes } = record
  const attributesObj = JSON.parse(attributes)
  if (datasourceType === 'Hive') {
  }
  return (
    <Descriptions className={styles['table-descriptions']}>
      <Descriptions.Item label="数据连接">{record.datasourceName}</Descriptions.Item>
      <Descriptions.Item label="类型">{record.datasourceType}</Descriptions.Item>
      {Object.keys(attributesObj).map((objKey) => (
        <Descriptions.Item label={objKey}>{attributesObj[objKey] || '-'}</Descriptions.Item>
      ))}
    </Descriptions>
  )
}
const Property = (props) => {
  const { filterForm } = props
  const [loading, setLoading] = useState(false)
  const [searchKey, setSearchKey] = useState('')
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [dataSource, setDataSource] = useState([])
  const [pageNum, setPageNum] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [pageTotal, setPageTotal] = useState(0)

  const getDataSourceList = async (extra?: any) => {
    const params = {
      pageIndex: pageNum,
      pageSize: pageSize,
      name: searchKey || '',
      itemType: filterForm?.itemType?.[0] || '',
      datasourceType: filterForm?.datasourceType || [],
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
    const sessionJson = sessionStorage.getItem('dataAsset.dataMap.dataDirectory')
    const sessionQuery = JSON.parse(sessionJson || '{}')
    sessionStorage.removeItem('dataAsset.dataMap.dataDirectory')

    if (filterForm) {
      getDataSourceList({
        pageIndex: 1,
        pageSize: 10,
        ...sessionQuery,
      })

      sessionStorage.removeItem('dataAsset.dataMap.dataDirectory')
    }
  }, [filterForm])

  const pageJump = (record) => {
    sessionStorage.setItem(
      'dataAsset.dataMap.dataDirectory',
      JSON.stringify({
        pageIndex: pageNum,
        pageSize: pageSize,
      }),
    )
    history.push(`/dataAsset/dataMap/assetDetail/${record.id}`)
  }
  const columns = [
    {
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (text, record) => {
        return (
          <>
            <div style={{ width: 40, height: 40, margin: '0 auto' }}>
              <img src="/dataAsset/dataMap/Table.svg" alt="" />
            </div>
            <div style={{ textAlign: 'center' }}>{record.labelName}</div>
          </>
        )
      },
    },
    {
      dataIndex: 'name',
      key: 'name',
      width: 280,
      render: (text, record) => {
        return (
          <>
            <a onClick={() => pageJump(record)}>{record.name}</a>
            {record.position && <div>{record.position}</div>}
          </>
        )
      },
    },
    {
      dataIndex: 'createTime',
      key: 'createTime',
      width: 280,
      render: (text, record) => {
        return (
          <Row justify={'start'}>
            <span style={{ marginRight: 20 }}>创建时间</span>
            <span>{text || '-'}</span>
          </Row>
        )
      },
    },
    {
      key: 'place',
    },
  ]

  return (
    <div className={styles['property-wrap']}>
      <Row justify={'space-between'} style={{ width: '100%' }}>
        {/* <Space>
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
        </Space> */}
        <div></div>
        <Input.Search
          placeholder="请输入关键字"
          onSearch={() => {
            getDataSourceList({
              pageIndex: 1,
              pageSize: 10,
            })
          }}
          onChange={debounce((e) => {
            setSearchKey(e.target.value)
          }, 150)}
          style={{ width: 200 }}
        />
      </Row>
      <Table
        style={{ marginTop: 10 }}
        loading={loading}
        rowKey="id"
        size="small"
        showHeader={false}
        // rowSelection={{
        //   selectedRowKeys,
        //   onChange: onSelectChange,
        // }}
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
