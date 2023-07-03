import React, { useEffect, useRef, useState } from 'react'
import PageWrap from '@/components/Common/PageWrap'
import { getHadoopList } from '@/pages/RegistrationCenter/ClusterManage/service'
import { IHadoop } from '@/pages/RegistrationCenter/ClusterManage/Hadoop/data.d'
import { Tree, Empty, Space, Switch, Table } from 'antd'

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

export default () => {
  const [hadoopList, setHadoopList] = useState<IHadoop[]>([])
  const initHadoop = async () => {
    const result = await getHadoopList()
    setHadoopList(result)
  }
  useEffect(() => {
    initHadoop()
  }, [])

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
    return hadoopList.map(({ yarnQueueModels }) => loopTree(yarnQueueModels))
  }

  return (
    <PageWrap>
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
    </PageWrap>
  )
}
