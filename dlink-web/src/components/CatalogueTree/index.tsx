import type { Key } from 'react'
import React, { useEffect, useState } from 'react'
import styles from './index.less'
import { Button, Col, Empty, Input, Menu, Modal, Row, Tooltip, Tree } from 'antd'
import { DownOutlined, FolderAddOutlined, SwitcherOutlined, FileOutlined } from '@ant-design/icons'
import type { TreeDataNode } from '@/components/Scheduler/SchedulerTree/Function'
import { convertToTreeData } from '@/components/Scheduler/SchedulerTree/Function'
import { Scrollbars } from 'react-custom-scrollbars'
import { generateList, getParentKey } from '@/utils/utils'
import { request2, CODE } from '@/components/Common/crud'
import { l } from '@/utils/intl'

import UpdateCatalogueForm from './UpdateCatalogueForm'
import {
  handleAddOrUpdateCatalogue,
  removeCatalogueById,
} from './service'
import { useOutsideClick } from '@/hooks'
import type { ItemType } from 'antd/es/menu/hooks/useItems'
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
  ajaxUrl: string
  sessionStorageKey: string
  defaultSelectRoot?: boolean
}

const CatalogueTree: React.FC<ICatalogueTreeProps> = (props: ICatalogueTreeProps) => {
  const {
    getCurrentCatalogue,
    simple = false,
    ajaxUrl,
    sessionStorageKey,
    defaultSelectRoot = false,
  } = props
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

  const treeDataUrl = `${ajaxUrl}/getCatalogueTreeData`

  //   获取目录
  const getTreeData = async () => {
    const result = await request2(treeDataUrl, {
      method: 'GET',
    })
    const data = result.datas
    const tempTreeData = convertToTreeData(data, 0)
    setTreeData(tempTreeData)
    const expandList: any[] = generateList(tempTreeData, []).map((item) => item.key)

    //默认展开所有
    setExpandedKeys(expandList)
    if (defaultSelectRoot && (selectedKeys.length === 0 || !data.some(i => i.id == selectedKeys[0])    )) {
      setSelectedKeys([expandList[0]])
      getCurrentCatalogue(tempTreeData[0])
    }
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
    const expandedKeys: any = expandList
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

  const createCatalogue = (node?: TreeDataNode | undefined) => {
    setCatalogueModalVisible(true)
    setIsCreateCatalogue(true)
    const defaultFormVal = {
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
        await removeCatalogueById(ajaxUrl, node!.id)
        getTreeData()
      },
    })
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

  const getNodeTreeRightClickMenu = () => {
    const { pageX, pageY } = { ...rightClickNodeTreeItem }
    const tmpStyle: any = {
      position: 'fixed',
      left: pageX,
      top: pageY,
    }
    let menuItems: ItemType[] = []
    if (rightClickNode) {
      menuItems = [
        { label: l('right.menu.createCatalogue'), key: 'CreateCatalogue' },
        {
          label: l('right.menu.rename'),
          key: 'Rename',
        },
        {
          label: l('right.menu.delete'),
          key: 'Delete',
        },
      ]
    }
    const menu = (
      <Menu
        onClick={({ key }) => handleMenuClick(key)}
        style={tmpStyle}
        className={styles.right_click_menu}
        items={menuItems}
      />
    )
    return rightClickMenuVisible ? menu : ''
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
    const sessionQuery = JSON.parse(sessionStorage.getItem(sessionStorageKey) || '{}')
    if (sessionQuery && sessionQuery.catalogueId) {
      setSelectedKeys([sessionQuery.catalogueId])
      getCurrentCatalogue({ id: sessionQuery.catalogueId } as any)
    }
    getTreeData()
  }, [])

  return simple ? (
    <DirectoryTree
      className={styles['catalogue-tree']}
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
                isCreateCatalogue ? ajaxUrl : `${ajaxUrl}/toRename`,
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
