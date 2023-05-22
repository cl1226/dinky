import React, { Key, useEffect, useState } from 'react'
import styles from './index.less'
import { Button, Col, Empty, Input, Menu, Modal, Row, Tooltip, Tree } from 'antd'
import { DownOutlined, FolderAddOutlined, SwitcherOutlined, FileOutlined } from '@ant-design/icons'
import { convertToTreeData, TreeDataNode } from '@/components/Scheduler/SchedulerTree/Function'
import { Scrollbars } from 'react-custom-scrollbars'
import { generateList, getParentKey } from '@/utils/utils'
import { l } from '@/utils/intl'

import UpdateCatalogueForm from './UpdateCatalogueForm'
import {
  handleAddOrUpdateCatalogue,
  getAllCatalogueTreeData,
  removeCatalogueById,
} from '@/pages/DataService/ApiDev/Catalogue/service'
import { useOutsideClick } from '@/hooks'
const { Search } = Input
const { DirectoryTree } = Tree

type RightClickMenu = {
  pageX: number
  pageY: number
  id: number
  categoryName: string
}

export type ICatalogueTreeProps = {
  getCurrentCatalogue: (node: TreeDataNode) => void
  simple?: boolean
}

const CatalogueTree: React.FC<ICatalogueTreeProps> = (props: ICatalogueTreeProps) => {
  const { getCurrentCatalogue, simple = false } = props
  const [expandedKeys, setExpandedKeys] = useState<Key[]>()
  const [searchValue, setSearchValue] = useState('')
  const [treeData, setTreeData] = useState<TreeDataNode[]>()
  const [autoExpandParent, setAutoExpandParent] = useState(true)
  const sref: any = React.createRef<Scrollbars>()
  const [catalogueModalVisible, setCatalogueModalVisible] = useState<boolean>(false)
  const [isCreateCatalogue, setIsCreateCatalogue] = useState<boolean>(true)
  const [rootCatalogueFormValues, setRootCatalogueFormValues] = useState({})
  const [rightClickNode, setRightClickNode] = useState<TreeDataNode>()
  const [rightClickMenuVisible, setRightClickMenuVisible] = useState<boolean>(false)
  const [rightClickNodeTreeItem, setRightClickNodeTreeItem] = useState<RightClickMenu>()
  const [selectedKeys, setSelectedKeys] = useState<(number | string)[]>([])

  const outsideRef: any = useOutsideClick(() => {
    setRightClickMenuVisible(false)
  })

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
    setRightClickMenuVisible(true)
  }

  const getNodeTreeRightClickMenu = () => {
    const { pageX, pageY } = { ...rightClickNodeTreeItem }
    const tmpStyle: any = {
      position: 'fixed',
      left: pageX,
      top: pageY,
    }
    let menuItems
    if (rightClickNode) {
      menuItems = (
        <>
          <Menu.Item key="CreateCatalogue">{l('right.menu.createCatalogue')}</Menu.Item>
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
    return rightClickMenuVisible ? menu : ''
  }

  const handleMenuClick = (key: string) => {
    if (key == 'CreateCatalogue') {
      createCatalogue(rightClickNode)
    } else if (key == 'Rename') {
      toRename(rightClickNode)
    } else if (key == 'Delete') {
      toDelete(rightClickNode)
    }
  }
  const createCatalogue = (node?: TreeDataNode | undefined) => {
    setCatalogueModalVisible(true)
    setIsCreateCatalogue(true)
    let defaultFormVal = {
      isLeaf: false,
      parentId: node && !node.isLeaf ? node.id : 0,
    }
    setRootCatalogueFormValues(defaultFormVal)
  }
  const toRename = (node: TreeDataNode | undefined) => {
    setCatalogueModalVisible(true)
    setIsCreateCatalogue(true)
    setRootCatalogueFormValues({
      id: node?.id,
      name: node?.name,
    })
  }
  const toDelete = (node: TreeDataNode | undefined) => {
    Modal.confirm({
      title: `删除目录`,
      content: `确定删除该目录【${node?.name}】吗？`,
      okText: l('button.confirm'),
      cancelText: l('button.cancel'),
      onOk: async () => {
        await removeCatalogueById(node!.id)
        getTreeData()
      },
    })
  }
  //选中节点时触发
  const onSelect = (selectedKeys: Key[], e: any) => {
    if (e.node) {
      console.log(e.node)
      setSelectedKeys([e.node.key])
      getCurrentCatalogue(e.node)
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
        <Button type="primary" onClick={() => createCatalogue()}>
          {l('button.createDir')}
        </Button>
      </Empty>
    )
    return treeData && treeData.length == 0 ? empty : ''
  }

  useEffect(() => {
    getTreeData()
  }, [])

  return simple ? (
    <DirectoryTree
      className={styles['simple-tree']}
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
  ) : (
    <div
      className={[styles['catalogue-tree']].join(' ')}
      ref={outsideRef}
      onClick={() => {
        setRightClickMenuVisible(false)
      }}
    >
      <Row>
        <Col span={24}>
          <Tooltip title={l('right.menu.createCatalogue')}>
            <Button type="text" icon={<FolderAddOutlined />} onClick={() => createCatalogue()} />
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
            selectedKeys={selectedKeys}
          />
        ) : null}
        {getNodeTreeRightClickMenu()}
        {getEmpty()}
        {catalogueModalVisible ? (
          <UpdateCatalogueForm
            onSubmit={async (value) => {
              const success = await handleAddOrUpdateCatalogue(
                isCreateCatalogue
                  ? '/api/dataservice/catalogue'
                  : '/api/dataservice/catalogue/toRename',
                value,
              )
              if (success) {
                setCatalogueModalVisible(false)
                setRootCatalogueFormValues({})
                getTreeData()
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

export default CatalogueTree
