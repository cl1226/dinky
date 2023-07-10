import React, { Key, useEffect, useMemo, useState } from 'react'
import { Row, TreeSelect, Input, Modal, message, Table, Tree } from 'antd'
import type { DataNode } from 'antd/es/tree'
import { generateList, getParentKey } from '@/utils/utils'
import { Scrollbars } from 'react-custom-scrollbars'

const { Search } = Input
const { DirectoryTree } = Tree

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
    const expandList: any[] = generateList(treeData, [])
    console.log('expandList', treeData)
    let expandedKeys = expandList
      .map((item) => {
        console.log('xxxx', item.name.indexOf(value) > -1, getParentKey(item.id, treeData))
        if (item.name.indexOf(value) > -1) {
          return getParentKey(item.id, treeData)
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
