import React, { useState, useEffect, useRef } from 'react'
import styles from './index.less'
import { connect, history } from 'umi'
import { Row, Checkbox, Table, Button, Space, Popconfirm, Input, Descriptions } from 'antd'
import type { CheckboxChangeEvent } from 'antd/es/checkbox'
import { debounce } from 'lodash'

import { getDataDirectoryList } from '@/pages/DataAsset/DataMap/service'
import { getIcon } from '@/pages/DataAsset/DataMap/Icon'
import { StateType } from '@/pages/DataAsset/DataMap/model'

const Property = (props) => {
  const { filterForm } = props
  const [searchKey, setSearchKey] = useState('')
  const [dataSource, setDataSource] = useState([])
  const [pageNum, setPageNum] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [pageTotal, setPageTotal] = useState(0)

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])

  const getDataSourceList = async (extra?: any) => {
    const params = {
      pageIndex: pageNum,
      pageSize: pageSize,
      name: searchKey || '',
      itemType: filterForm?.itemType?.[0] || '',
      datasourceType: filterForm?.datasourceType || [],
      ...(extra || {}),
    }

    props.dispatch({
      type: 'DataAssetMap/toggleDirectoryLoading',
      payload: true,
    })

    const { list, total, pn, ps } = await getDataDirectoryList(params)
    props.dispatch({
      type: 'DataAssetMap/toggleDirectoryLoading',
      payload: false,
    })
    setDataSource(list)
    setPageTotal(total)
    setPageNum(pn)
    setPageSize(ps)
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
    history.push(`/dataAsset/dataMap/assetDetail/${record.type}/${record.id}`)
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
              {getIcon(record.type, 40)}
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
          <Checkbox
            onChange={(e: CheckboxChangeEvent) => {
              console.log(`checked = ${e.target.checked}`)
            }}
          >
            全选/反选
          </Checkbox>

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
        rowKey="id"
        size="small"
        showHeader={false}
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
    </div>
  )
}

export default connect(({ DataAssetMap }: { DataAssetMap: StateType }) => ({
  filterForm: DataAssetMap.filterForm,
}))(Property)
