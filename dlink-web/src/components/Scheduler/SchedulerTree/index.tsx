/*
 *
 *  Licensed to the Apache Software Foundation (ASF) under one or more
 *  contributor license agreements.  See the NOTICE file distributed with
 *  this work for additional information regarding copyright ownership.
 *  The ASF licenses this file to You under the Apache License, Version 2.0
 *  (the "License"); you may not use this file except in compliance with
 *  the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

import React, { Key, useEffect, useMemo, useState } from 'react'
import { connect, history } from 'umi'
import { DownOutlined, FolderAddOutlined, SwitcherOutlined } from '@ant-design/icons'
import { Button, Col, Empty, Input, Menu, message, Modal, Row, Tooltip, Tree } from 'antd'
import { getWorkflowCatalogueTreeData } from '@/pages/Scheduler/service'
import {
  convertToTreeData,
  getTreeNodeByKey,
  TreeDataNode,
} from '@/components/Scheduler/SchedulerTree/Function'
import styles from './index.less'
import { StateType } from '@/pages/Scheduler/model'
import {
  handleAddOrUpdate,
  handleAddOrUpdateWithResult,
  handleRemoveById,
} from '@/components/Common/crud'

import { Scrollbars } from 'react-custom-scrollbars'
import { getIcon } from '@/components/Scheduler/icon'

import UpdateCatalogueForm from '@/components/Scheduler/SchedulerTree/components/UpdateCatalogueForm'
import SimpleTaskForm from '@/components/Scheduler/SchedulerTree/components/SimpleTaskForm'

import { l } from '@/utils/intl'

type SchedulerTreeProps = {
  rightClickMenu: StateType['rightClickMenu']
  dispatch: any
  tabs: StateType['tabs']
  current: StateType['current']
}

type RightClickMenu = {
  pageX: number
  pageY: number
  id: number
  categoryName: string
}

//将树形节点改为一维数组
const generateList = (data: any, list: any[]) => {
  for (const element of data) {
    const node = element
    const { name, id, parentId, level } = node
    list.push({ name, id, key: id, title: name, parentId, level })
    if (node.children) {
      generateList(node.children, list)
    }
  }
  return list
}

// tree树 匹配方法
const getParentKey = (key: number | string, tree: any): any => {
  let parentKey
  for (const element of tree) {
    const node = element
    if (node.children) {
      if (node.children.some((item: any) => item.id === key)) {
        parentKey = node.id
      } else if (getParentKey(key, node.children)) {
        parentKey = getParentKey(key, node.children)
      }
    }
  }
  return parentKey
}

const getTreeSingleNode = (key: number | string, tree: any): any => {
  let findNode
  for (const element of tree) {
    const node = element
    if (node.children) {
      const findIndex = node.children.findIndex((item: any) => item.taskId === key)
      if (findIndex > -1) {
        findNode = node.children[findIndex]
      } else if (getTreeSingleNode(key, node.children)) {
        findNode = getTreeSingleNode(key, node.children)
      }
    }
  }
  return findNode
}
const { DirectoryTree } = Tree
const { Search } = Input

const SchedulerTree: React.FC<SchedulerTreeProps> = (props) => {
  const { rightClickMenu, dispatch, tabs, current } = props
  const [treeData, setTreeData] = useState<TreeDataNode[]>()
  const [expandedKeys, setExpandedKeys] = useState<Key[]>()
  const [rightClickNodeTreeItem, setRightClickNodeTreeItem] = useState<RightClickMenu>()
  const [updateCatalogueModalVisible, handleUpdateCatalogueModalVisible] = useState<boolean>(false)
  const [updateTaskModalVisible, handleUpdateTaskModalVisible] = useState<boolean>(false)
  const [isCreate, setIsCreate] = useState<boolean>(true)
  const [catalogueFormValues, setCatalogueFormValues] = useState({})
  const [taskFormValues, setTaskFormValues] = useState({})
  const [activeNode, setActiveNode] = useState<any>({})
  const [rightClickNode, setRightClickNode] = useState<TreeDataNode>()
  const [available, setAvailable] = useState<boolean>(true)
  const sref: any = React.createRef<Scrollbars>()
  const [searchValue, setSearchValue] = useState('')
  const [autoExpandParent, setAutoExpandParent] = useState(true)
  const [selectedKeys, setSelectedKeys] = useState<(number | string)[]>([])

  const getTreeData = async (isInit?: boolean) => {
    const result = await getWorkflowCatalogueTreeData()
    let data = result.datas
    const tempTreeData = convertToTreeData(data, 0)
    setTreeData(tempTreeData)
    const expandList: any[] = generateList(tempTreeData, []).map((item) => item.key)

    //默认展开所有
    // setExpandedKeys(expandList)

    if (isInit) {
      if (history.location.query?.workflowId) {
        const findNode = getTreeSingleNode(
          Number(history.location.query?.workflowId),
          loop(tempTreeData),
        )
        setExpandedKeys([findNode.key])
        setSelectedKeys([findNode.key])
        toOpen(findNode)
      } else if (current) {
        setSelectedKeys([current.treeId])
        setExpandedKeys([current.treeId])
      }
    }
  }

  const onChange = (e: any) => {
    let { value } = e.target
    if (!value) {
      setSearchValue(value)
      return
    }
    value = String(value).trim()
    const expandList: any[] = generateList(treeData, [])
    let expandedKeys: any = expandList
      .map((item: any) => {
        if (item && item.name.indexOf(value) > -1) {
          return getParentKey(item.key, treeData)
        }
        return null
      })
      .filter((item: any, i: number, self: any) => item && self.indexOf(item) === i)
    setExpandedKeys(expandedKeys)
    setSearchValue(value)
    setAutoExpandParent(true)
  }

  const openByKey = async (key: any) => {
    const result = await getWorkflowCatalogueTreeData()
    let data = result.datas
    let list = data
    for (const element of list) {
      element.title = element.name
      element.key = element.id
      if (element.isLeaf) {
        element.icon = getIcon(element.type)
      }
    }
    data = convertToTreeData(list, 0)
    setTreeData(data)
    let node = getTreeNodeByKey(data, key)
    onSelect([], { node: node })
  }

  useEffect(() => {
    getTreeData(true)
  }, [])

  const handleMenuClick = (key: string) => {
    if (key == 'Open') {
      toOpen(rightClickNode)
    } else if (key == 'CreateCatalogue') {
      createCatalogue(rightClickNode)
    } else if (key == 'CreateRootCatalogue') {
      createRootCatalogue()
    } else if (key == 'CreateTask') {
      createTask(rightClickNode)
    } else if (key == 'Rename') {
      toRename(rightClickNode)
    } else if (key == 'Delete') {
      toDelete(rightClickNode)
    }
  }

  const activeTabCall = (node: TreeDataNode) => {
    dispatch &&
      dispatch({
        type: 'Scheduler/changeActiveKey',
        payload: node.taskId,
      })
  }

  const checkInPans = (node: TreeDataNode) => {
    for (let item of tabs?.panes!) {
      if (item.key == node.taskId) {
        return true
      }
    }
    return false
  }

  const toOpen = (node: TreeDataNode | undefined) => {
    if (!available) {
      return
    }

    setAvailable(false)
    setTimeout(() => {
      setAvailable(true)
    }, 200)

    if (node?.isLeaf && node.taskId) {
      if (checkInPans(node)) {
        activeTabCall(node)
        return
      }

      let newTabs = tabs
      let newPane: any = {
        title: node.name,
        key: node.taskId,
        icon: node.icon,
        closable: true,
        path: node.path,
        treeId: node.id,
        task: {
          session: '',
          maxRowNum: 100,
          jobName: node.name,
          useResult: true,
          useChangeLog: false,
          useAutoCancel: false,
          useSession: false,
          useRemote: true,
        },
      }
      newTabs!.activeKey = node.taskId
      if (checkInPans(node)) {
        return
      }

      newTabs!.panes!.push(newPane)
      dispatch &&
        dispatch({
          type: 'Scheduler/saveTabs',
          payload: newTabs,
        })
    }
  }

  const createCatalogue = (node: TreeDataNode | undefined) => {
    if (!node?.isLeaf) {
      handleUpdateCatalogueModalVisible(true)
      setIsCreate(true)
      setCatalogueFormValues({
        isLeaf: false,
        parentId: node?.id,
      })
    } else {
      message.error('只能在目录上创建目录')
    }
  }

  const createRootCatalogue = () => {
    handleUpdateCatalogueModalVisible(true)
    setIsCreate(true)
    setCatalogueFormValues({
      isLeaf: false,
      parentId: 0,
    })
  }

  const toRename = (node: TreeDataNode | undefined) => {
    handleUpdateCatalogueModalVisible(true)
    setIsCreate(false)
    setActiveNode(node)
    setCatalogueFormValues({
      id: node?.id,
      taskId: node?.taskId,
      name: node?.name,
      projectCode: node?.projectCode,
    })
  }

  const createTask = (node: TreeDataNode | undefined) => {
    if (!node?.isLeaf) {
      handleUpdateTaskModalVisible(true)
      setIsCreate(true)
      setTaskFormValues({
        parentId: node?.id,
      })
    } else {
      message.error('只能在目录上创建作业')
    }
  }

  const toDelete = (node: TreeDataNode | undefined) => {
    let label = node?.taskId == null ? '目录' : '作业'
    Modal.confirm({
      title: `删除${label}`,
      content: `确定删除该${label}【${node?.name}】吗？`,
      okText: l('button.confirm'),
      cancelText: l('button.cancel'),
      onOk: async () => {
        await handleRemoveById('/api/workflow/catalogue', node!.id)
        if (node?.taskId) {
          dispatch({
            type: 'Scheduler/deleteTabByKey',
            payload: node?.taskId,
          })
        }
        getTreeData()
      },
    })
  }

  const getNodeTreeRightClickMenu = () => {
    const { pageX, pageY } = { ...rightClickNodeTreeItem }
    const tmpStyle: any = {
      position: 'fixed',
      left: pageX,
      top: pageY,
    }
    let menuItems
    if (rightClickNode && rightClickNode.isLeaf) {
      menuItems = (
        <>
          <Menu.Item key="Open">{l('right.menu.open')}</Menu.Item>
          <Menu.Item key="Delete">{l('right.menu.delete')}</Menu.Item>
        </>
      )
    } else if (rightClickNode && rightClickNode.children && rightClickNode.children.length > 0) {
      menuItems = (
        <>
          <Menu.Item key="CreateCatalogue">{l('right.menu.createCatalogue')}</Menu.Item>
          <Menu.Item key="CreateRootCatalogue">{l('right.menu.createRootCatalogue')}</Menu.Item>
          <Menu.Item key="CreateTask">{l('right.menu.createTask')}</Menu.Item>
          <Menu.Item key="Rename">{l('right.menu.rename')}</Menu.Item>
          <Menu.Item key="Delete">{l('right.menu.delete')}</Menu.Item>
        </>
      )
    } else {
      menuItems = (
        <>
          <Menu.Item key="CreateCatalogue">{l('right.menu.createCatalogue')}</Menu.Item>
          <Menu.Item key="CreateTask">{l('right.menu.createTask')}</Menu.Item>
          <Menu.Item key="Rename">{l('right.menu.rename')}</Menu.Item>
          <Menu.Item key="Delete">{l('right.menu.delete')}</Menu.Item>
        </>
      )
    }
    const menu = (
      <Menu
        onClick={({ key }) => handleMenuClick(key)}
        style={tmpStyle}
        className={styles.right_click_menu}
      >
        {menuItems}
      </Menu>
    )
    return rightClickMenu ? menu : ''
  }

  const getEmpty = () => {
    const empty = (
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}>
        <Button
          type="primary"
          onClick={() => {
            handleUpdateCatalogueModalVisible(true)
            setIsCreate(true)
            setCatalogueFormValues({
              isLeaf: false,
              parentId: 0,
            })
          }}
        >
          {l('button.createDir')}
        </Button>
      </Empty>
    )
    return treeData && treeData.length == 0 ? empty : ''
  }

  const handleContextMenu = (e: any) => {
    setRightClickNode(e.node)
    setRightClickNodeTreeItem({
      pageX: e.event.pageX,
      pageY: e.event.pageY,
      id: e.node.id,
      categoryName: e.node.name,
    })
    dispatch &&
      dispatch({
        type: 'Scheduler/showRightClickMenu',
        payload: true,
      })
  }

  //选中节点时触发
  const onSelect = (selectedKeys: Key[], e: any) => {
    if (e.node && e.node.isLeaf) {
      setSelectedKeys([e.node.key])
      dispatch({
        type: 'Scheduler/saveCurrentPath',
        payload: e.node.path,
      })
      toOpen(e.node)
    }
  }

  const offExpandAll = () => {
    setExpandedKeys([])
  }

  // 树节点展开/收缩
  const onExpand = (expandedKeys: Key[]) => {
    setExpandedKeys(expandedKeys)
    setAutoExpandParent(false)
  }

  const loop = (data: any) =>
    data?.map((item: any) => {
      const index = item.title.indexOf(searchValue)
      const beforeStr = item.title.substr(0, index)
      const afterStr = item.title.substr(index + searchValue.length)
      item.icon = getIcon(item.type)
      const title =
        index > -1 ? (
          <span>
            {beforeStr}
            <span className={styles['site-tree-search-value']}>{searchValue}</span>
            {afterStr}
          </span>
        ) : (
          <span>{item.title}</span>
        )
      if (item.children) {
        return {
          isLeaf: item.isLeaf,
          name: item.name,
          id: item.id,
          taskId: item.taskId,
          parentId: item.parentId,
          path: item.path,
          icon: item.isLeaf ? item.icon : '',
          title,
          key: item.key,
          projectCode: item.projectCode,
          children: loop(item.children),
        }
      }
      return {
        isLeaf: item.isLeaf,
        name: item.name,
        id: item.id,
        taskId: item.taskId,
        parentId: item.parentId,
        path: item.path,
        icon: item.isLeaf ? item.icon : '',
        title,
        projectCode: item.projectCode,
        key: item.key,
      }
    })

  return (
    <div className={styles.tree_div}>
      <Row>
        <Col span={24}>
          <Tooltip title={l('right.menu.createRootCatalogue')}>
            <Button type="text" icon={<FolderAddOutlined />} onClick={createRootCatalogue} />
          </Tooltip>
          <Tooltip title={l('button.collapseDir')}>
            <Button type="text" icon={<SwitcherOutlined />} onClick={offExpandAll} />
          </Tooltip>
        </Col>
      </Row>
      <Search
        style={{ marginBottom: 8 }}
        placeholder="Search"
        onChange={onChange}
        allowClear={true}
      />
      <Scrollbars style={{ height: 'calc(100vh - 72px)' }} ref={sref}>
        {treeData?.length && (
          <DirectoryTree
            multiple
            onRightClick={handleContextMenu}
            onSelect={onSelect}
            switcherIcon={<DownOutlined />}
            // showIcon={true}
            treeData={loop(treeData)}
            onExpand={onExpand}
            autoExpandParent={autoExpandParent}
            expandedKeys={expandedKeys}
            selectedKeys={selectedKeys}
          />
        )}

        {getNodeTreeRightClickMenu()}
        {getEmpty()}
        {updateCatalogueModalVisible ? (
          <UpdateCatalogueForm
            onSubmit={async (value) => {
              const success = await handleAddOrUpdate(
                isCreate ? '/api/workflow/catalogue' : '/api/workflow/catalogue/toRename',
                value,
              )
              if (success) {
                handleUpdateCatalogueModalVisible(false)
                setCatalogueFormValues({})
                getTreeData()
                if (value.taskId) {
                  dispatch({
                    type: 'Scheduler/renameTab',
                    payload: {
                      key: value.taskId,
                      title: value.name,
                      icon: activeNode.icon,
                    },
                  })
                }
              }
            }}
            onCancel={() => {
              handleUpdateCatalogueModalVisible(false)
              setCatalogueFormValues({})
            }}
            updateModalVisible={updateCatalogueModalVisible}
            values={catalogueFormValues}
            isCreate={isCreate}
          />
        ) : null}
        {updateTaskModalVisible ? (
          <SimpleTaskForm
            onSubmit={async (value) => {
              const datas = await handleAddOrUpdateWithResult(
                '/api/workflow/catalogue/createTask',
                value,
              )
              if (datas) {
                handleUpdateTaskModalVisible(false)
                setTaskFormValues({})
                openByKey(datas.id)
              }
            }}
            onCancel={() => {
              handleUpdateTaskModalVisible(false)
              setTaskFormValues({})
            }}
            updateModalVisible={updateTaskModalVisible}
            values={taskFormValues}
            isCreate={isCreate}
          />
        ) : null}
      </Scrollbars>
    </div>
  )
}

export default connect(({ Scheduler }: { Scheduler: StateType }) => ({
  current: Scheduler.current,
  currentPath: Scheduler.currentPath,
  tabs: Scheduler.tabs,
  rightClickMenu: Scheduler.rightClickMenu,
}))(SchedulerTree)
