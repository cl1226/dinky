import React, { useEffect, useState } from 'react'
import type { TreeProps } from 'antd'
import { Button, Space, Input, Modal, Tree } from 'antd'
import type { TreeDataNode } from '@/components/Scheduler/SchedulerTree/Function'
import {
  handleAddOrUpdateCatalogue,
  getAllCatalogueTreeData,
  removeCatalogueById,
} from '@/pages/DataAsset/MetaDataManage/TaskManage/service'
import type { CatalogueValue } from '../../index.d'

const { DirectoryTree } = Tree
interface ICatalogueSelectProps {
  value?: CatalogueValue
  style?: React.CSSProperties
  onChange?: (e: CatalogueValue) => void
}

function convertToTreeData(data: TreeDataNode[], pid: number, path?: string[]) {
  !path && (path = [])
  const result: TreeDataNode[] = []
  let temp: TreeDataNode[] = []
  for (let i = 0; i < data?.length; i++) {
    if (data[i].parentId === pid) {
      const obj = data[i]
      obj.title = obj.name
      obj.key = obj.id
      obj.value = obj.key
      obj.path = path.slice()
      obj.path.push(obj.name)
      temp = convertToTreeData(data, data[i].id, obj.path)
      if (temp.length > 0) {
        obj.children = temp
      }
      result.push(obj)
    }
  }
  return result
}

export default ({ value, onChange }: ICatalogueSelectProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [treeData, settreeData] = useState<TreeDataNode[]>([])
  const [currentCatalogue, setCurrentCatalogue] = useState<CatalogueValue | undefined>(value)

  //   获取目录
  const getTreeData = async () => {
    const result = await getAllCatalogueTreeData()
    const data = result.datas
    const tempTreeData = convertToTreeData(data, 0)
    settreeData(tempTreeData)
  }

  const onSelect: TreeProps['onSelect'] = (_selectedKeys, { node }) => {
    setCurrentCatalogue({ id: node.id, path: '/' + node?.path?.join('/') })
  }

  useEffect(() => {
    getTreeData()
  }, [])

  const handleOk = () => {
    if (onChange) {
      onChange({ ...currentCatalogue } as CatalogueValue)
    }
    setIsModalOpen(false)
  }
  return (
    <>
      <Input.Group compact>
        <Input style={{ width: 'calc(100% - 100px)' }} value={value?.path} />
        <Button
          style={{ width: 100 }}
          onClick={() => {
            setIsModalOpen(true)
          }}
        >
          选择目录
        </Button>
      </Input.Group>

      <Modal
        title="选择目录"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => {
          setIsModalOpen(false)
        }}
      >
        <div>选中路径：{currentCatalogue?.path}</div>
        <DirectoryTree defaultExpandAll onSelect={onSelect} treeData={treeData} />
      </Modal>
    </>
  )
}
