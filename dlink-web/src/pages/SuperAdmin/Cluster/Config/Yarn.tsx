import React from 'react'
import styles from './index.less'
import { Empty, Table } from 'antd'
import { ITabComProps } from '@/pages/SuperAdmin/type.d'

// tree树 匹配方法
const loopTree = (arr): any => {
  if (!Array.isArray(arr) || arr.length < 1) return null
  const [root] = arr.filter((item) => item.name === 'root')
  const addChildren = (node, dataList) => {
    const children = dataList
      .filter((item) => item?.parentName === node.name)
      .map((item) => ({
        ...addChildren(item, dataList),
        aclSubmitApps: item.aclSubmitApps || node.aclSubmitApps || '',
      }))
    return { ...node, ...(children && children.length ? { children } : {}) }
  }
  return addChildren(root, arr)
}

const YarnTab: React.FC<ITabComProps> = (props: ITabComProps) => {
  const { mode, detailInfo } = props

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '提交用户限制',
      dataIndex: 'aclSubmitApps',
      key: 'aclSubmitApps',
      width: 150,
      render: (text) => {
        if (text === '*') return `* (无限制)`
        return text
      },
    },

    {
      title: '集群名称',
      dataIndex: 'clusterName',
      key: 'clusterName',
      width: 150,
    },
    {
      title: '调度策略',
      dataIndex: 'policy',
      key: 'policy',
      width: 150,
    },
  ]
  const getDataSource = () => {
    return [loopTree(detailInfo)]
  }

  return (
    <>
      {detailInfo && detailInfo.length ? (
        <div className={styles['yarn-wrap']}>
          <Table
            size={'small'}
            rowKey={'name'}
            columns={columns}
            dataSource={getDataSource()}
            expandable={{
              defaultExpandAllRows: true,
            }}
            pagination={false}
          />
        </div>
      ) : (
        <Empty />
      )}
    </>
  )
}

export default YarnTab
