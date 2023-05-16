import React, { Key, useCallback, useEffect, useState } from 'react'
import styles from './index.less'
import { Button, Col, Empty, Input, Menu, message, Modal, Row, Tooltip, Tree } from 'antd'
import { DownOutlined, FolderAddOutlined, SwitcherOutlined, FileOutlined } from '@ant-design/icons'
import {
  convertToTreeData,
  getTreeNodeByKey,
  TreeDataNode,
} from '@/components/Scheduler/SchedulerTree/Function'
import { Scrollbars } from 'react-custom-scrollbars'

import { connect } from 'umi'
import { StateType } from '@/pages/DataService/ApiDev/Catalogue/model'
import { l } from '@/utils/intl'

import UpdateCatalogueForm from './UpdateCatalogueForm'
import {
  handleAddOrUpdate,
  getAllCatalogueTreeData,
} from '@/pages/DataService/ApiDev/Catalogue/service'

const { Search } = Input
const { DirectoryTree } = Tree

type RightClickMenu = {
  pageX: number
  pageY: number
  id: number
  categoryName: string
}

const CatalogueTree: React.FC<{}> = (props: any) => {
  const { rightClickMenu, dispatch } = props

  const [expandedKeys, setExpandedKeys] = useState<Key[]>()
  const [searchValue, setSearchValue] = useState('')
  const [treeData, setTreeData] = useState<TreeDataNode[]>()
  const [autoExpandParent, setAutoExpandParent] = useState(true)
  const sref: any = React.createRef<Scrollbars>()
  const [catalogueModalVisible, setCatalogueModalVisible] = useState<boolean>(false)
  const [isCreateCatalogue, setIsCreateCatalogue] = useState<boolean>(true)
  const [rootCatalogueFormValues, setRootCatalogueFormValues] = useState({})
  const [rightClickNode, setRightClickNode] = useState<TreeDataNode>()
  const [rightClickNodeTreeItem, setRightClickNodeTreeItem] = useState<RightClickMenu>()

  //   获取目录
  const getTreeData = async () => {
    const result = await getAllCatalogueTreeData()
    let data = result.datas
    const tempTreeData = convertToTreeData(data, 0)
    setTreeData(tempTreeData)
    const expandList: any[] = generateList(tempTreeData, []).map((item) => item.key)

    //默认展开所有
    setExpandedKeys(expandList)
  }

  // 创建根目录
  const createRootCatalogue = () => {}
  //   折叠树状目录
  const offExpandAll = () => {
    setExpandedKeys([])
  }
  //   搜索框变更时
  const onSearchChange = (e: any) => {
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

  //   鼠标右键
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

  const handleMenuClick = (key: string) => {
    if (key == 'Open') {
      toOpen(rightClickNode)
    } else if (key == 'CreateCatalogue') {
      createCatalogue(rightClickNode)
    } else if (key == 'Rename') {
      toRename(rightClickNode)
    } else if (key == 'Delete') {
      toDelete(rightClickNode)
    }
  }
  const toOpen = (node: TreeDataNode | undefined) => {}
  const createCatalogue = (node: TreeDataNode | undefined) => {}
  const toRename = (node: TreeDataNode | undefined) => {}
  const toDelete = (node: TreeDataNode | undefined) => {}
  //选中节点时触发
  const onSelect = (selectedKeys: Key[], e: any) => {
    if (e.node && e.node.isLeaf) {
      dispatch({
        type: 'Scheduler/saveCurrentPath',
        payload: e.node.path,
      })
      toOpen(e.node)
    }
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
      item.icon = <FileOutlined />
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

  // 空数据展示
  const getEmpty = () => {
    const empty = (
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}>
        <Button
          type="primary"
          onClick={() => {
            setCatalogueModalVisible(true)
            setIsCreateCatalogue(true)
            setRootCatalogueFormValues({
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

  useEffect(() => {
    getTreeData()
  }, [])

  return (
    <div className={styles['catalogue-tree']}>
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
        onChange={onSearchChange}
        allowClear={true}
      />
      <Scrollbars style={{ height: 'calc(100% - 72px)' }} ref={sref}>
        {treeData?.length ? (
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
          />
        ) : null}
        {getNodeTreeRightClickMenu()}
        {getEmpty()}
        {catalogueModalVisible ? (
          <UpdateCatalogueForm
            onSubmit={async (value) => {
              const success = await handleAddOrUpdate(
                isCreateCatalogue
                  ? '/api/dataservice/catalogue'
                  : '/api/dataservice/catalogue/toRename',
                value,
              )
              if (success) {
                setCatalogueModalVisible(false)
                setRootCatalogueFormValues({})
                getTreeData()
                if (value.taskId) {
                  dispatch({
                    type: 'Catalogue/renameTab',
                    payload: {
                      key: value.taskId,
                      title: value.name,
                    },
                  })
                }
              }
            }}
            onCancel={() => {
              setCatalogueModalVisible(false)
              setRootCatalogueFormValues({})
            }}
            updateModalVisible={catalogueModalVisible}
            values={rootCatalogueFormValues}
            isCreate={isCreateCatalogue}
          />
        ) : null}
      </Scrollbars>
    </div>
  )
}

export default connect(({ Catalogue }: { Catalogue: StateType }) => ({}))(CatalogueTree)
