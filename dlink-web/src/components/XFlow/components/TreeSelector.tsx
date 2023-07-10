import React, { Key, useEffect, useMemo, useState } from 'react'
import { Row, TreeSelect, Input, Modal, message, Table, Tree } from 'antd'
import type { DataNode } from 'antd/es/tree'

import { Scrollbars } from 'react-custom-scrollbars'

const { Search } = Input
const { DirectoryTree } = Tree

// tree树 匹配方法
export const getParentKey = (key: number | string, tree: any): any => {
  let parentKey
  for (const element of tree) {
    const node = element
    if (node.children) {
      if (node.children.some((item: any) => item.key === key)) {
        parentKey = node.key
      } else if (getParentKey(key, node.children)) {
        parentKey = getParentKey(key, node.children)
      }
    }
  }
  return parentKey
}

//将树形节点改为一维数组
export const generateList = (data: any, list: any[]) => {
  for (const element of data) {
    const node = element
    const { name, id, key } = node
    list.push({ name, id, key: key, title: name })
    if (node.children) {
      generateList(node.children, list)
    }
  }
  return list
}

const initLoop = (data) =>
  data.map((item) => {
    if (item.children) {
      return {
        name: item.name,
        id: item.id,
        key: `catalogue:${item.id}`,
        isLeaf: false,
        children: initLoop(item.children),
      }
    }
    return {
      name: item.name,
      id: item.id,
      key: item.filePath,
      isLeaf: true,
    }
  })

export const TreeSelector = (props) => {
  const { treeData, onChange, multiple = false, selectedKeys } = props

  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([])
  const [searchValue, setSearchValue] = useState('')
  const [autoExpandParent, setAutoExpandParent] = useState(true)

  const onExpand = (newExpandedKeys: React.Key[]) => {
    setExpandedKeys(newExpandedKeys)
    setAutoExpandParent(false)
  }
  const filterMultiVal = (vals) => vals.filter((val) => val.indexOf('catalogue:') === -1)
  //选中节点时触发
  const onCheck = (keys: any, e: any) => {
    if (e.node) {
      let changeVal = multiple ? filterMultiVal(keys) : [e.node.key]
      if (keys.length === 0) changeVal = []

      onChange && onChange(changeVal)
    }
  }

  const onSearchValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { value } = e.target
    if (!value) {
      setSearchValue(value)
      return
    }
    value = String(value).trim()
    const initLoopTree = initLoop(treeData)
    const expandList: any[] = generateList(initLoopTree, [])
    let expandedKeys = expandList
      .map((item) => {
        if (item.name.indexOf(value) > -1) {
          return getParentKey(item.key, initLoopTree)
        }
        return null
      })
      .filter((item, i, self) => item && self.indexOf(item) === i)

    setExpandedKeys(expandedKeys as React.Key[])
    setSearchValue(value)
    setAutoExpandParent(true)
  }

  const loopTreeData = useMemo(() => {
    const loop = (data) =>
      data.map((item) => {
        const strTitle = item.name as string
        const index = strTitle.indexOf(searchValue)
        const beforeStr = strTitle.substring(0, index)
        const afterStr = strTitle.slice(index + searchValue.length)
        const title =
          index > -1 ? (
            <span>
              {beforeStr}
              <span
                style={{
                  color: '#f50',
                }}
              >
                {searchValue}
              </span>
              {afterStr}
            </span>
          ) : (
            <span>{strTitle}</span>
          )
        if (item.children) {
          return {
            name: item.name,
            id: item.id,
            title,
            key: `catalogue:${item.id}`,
            isLeaf: false,
            selectable: false,
            children: loop(item.children),
            checkable: multiple,
          }
        }

        return {
          name: item.name,
          id: item.id,
          title,
          key: item.filePath,
          isLeaf: true,
          checkable: true,
          selectable: false,
        }
      })
    return loop(treeData)
  }, [searchValue, treeData])

  return (
    <>
      <Search
        style={{ marginBottom: 8 }}
        placeholder="输入关键字"
        allowClear
        onChange={onSearchValueChange}
      />
      <Scrollbars style={{ height: 300 }}>
        <DirectoryTree
          checkable
          multiple={multiple}
          onCheck={onCheck}
          onExpand={onExpand}
          expandedKeys={expandedKeys}
          autoExpandParent={autoExpandParent}
          checkedKeys={selectedKeys}
          treeData={loopTreeData}
        />
      </Scrollbars>
    </>
  )
}
