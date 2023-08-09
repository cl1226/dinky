import React, { useEffect, useState } from 'react'
import { Select, Input, Modal, message, Table, Tag } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import type { CustomTagProps } from 'rc-select/lib/BaseSelect'
import { getSourceTree } from '@/pages/Resource/ResourceManage/service'
import { TreeSelector } from './TreeSelector'

export function convertToTreeData(data, pid: number, path?: string[]) {
  !path && (path = [])
  const result: any = []
  let temp = []
  for (let i = 0; i < data?.length; i++) {
    if (data[i].parentId === pid) {
      let obj = data[i]
      temp = convertToTreeData(data, data[i].id)
      if (temp.length > 0) {
        obj.children = [
          ...temp,
          ...(obj.fileEntities || []).map((jtem) => ({
            ...jtem,
            parentId: jtem.catalogueId,
            selectable: true,
          })),
        ]
        obj.selectable = false
      } else {
        obj.selectable = obj.isLeaf
        obj.children = [
          ...(obj.fileEntities || []).map((jtem) => ({
            ...jtem,
            parentId: jtem.catalogueId,
            selectable: true,
          })),
        ]
      }
      result.push(obj)
    }
  }
  return result
}

export const SourceSelect: React.FC<any> = (props) => {
  const { value, valueKey = 'id', onChange, placeholder = '请选择资源', ...resetProps } = props
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [selectVal, setSelectVal] = useState<any>(props.value)
  const [treeData, setTreeData] = useState([])

  const initJarTree = async () => {
    setLoading(true)
    const result = await getSourceTree()
    setTreeData(convertToTreeData(result || [], 0))
    setLoading(false)
  }
  const closeModal = () => {
    setShowModal(false)
    setSelectVal('')
  }
  const onConfirm = () => {
    onChange && onChange(selectVal)
    setShowModal(false)
  }

  const tagRender = (props: CustomTagProps) => {
    const { label } = props
    const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
      event.preventDefault()
      event.stopPropagation()
    }
    return (
      <Tag
        onMouseDown={onPreventMouseDown}
        closable={false}
        style={{ marginRight: 3, marginBottom: 3 }}
      >
        {label}
      </Tag>
    )
  }

  return (
    <>
      <Select
        mode="multiple"
        placeholder={placeholder}
        tagRender={tagRender}
        dropdownClassName="hiddenDropdown"
        value={valueKey === 'Object' ? value?.name : value}
        onClick={(event) => {
          setShowModal(true)
          initJarTree()
        }}
        {...resetProps}
      ></Select>

      <Modal
        title="资源"
        centered
        open={showModal}
        onOk={() => onConfirm()}
        onCancel={() => closeModal()}
        width={500}
      >
        <TreeSelector
          treeData={treeData}
          onChange={(e) => setSelectVal(e)}
          selectedKeys={selectVal}
          multiple={true}
        ></TreeSelector>
      </Modal>
    </>
  )
}
