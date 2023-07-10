import React, { useEffect, useState } from 'react'
import { Select, Input, Modal, message, Table, Tree } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { getJarTree } from '@/pages/RegistrationCenter/ResourceManage/service'
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

export const JarSelect: React.FC<any> = (props) => {
  const { value, valueKey = 'id', onChange, placeholder = '请选择主程序包', ...resetProps } = props
  const [showModal, setShowModal] = useState(false)

  const [selectVal, setSelectVal] = useState(props.value)
  const [treeData, setTreeData] = useState([])

  const initJarTree = async () => {
    const result = await getJarTree()
    setTreeData(convertToTreeData(result || [], 0))
  }
  const closeModal = () => {
    setShowModal(false)
    setSelectVal('')
  }
  const onConfirm = () => {
    onChange && onChange(selectVal)
    setShowModal(false)
  }

  return (
    <>
      <Input
        readOnly
        allowClear
        placeholder={placeholder}
        value={valueKey === 'Object' ? value?.name : value}
        suffix={<PlusOutlined />}
        onClick={() => {
          setShowModal(true)
          initJarTree()
        }}
        {...resetProps}
      ></Input>

      <Modal
        title="主程序包"
        centered
        open={showModal}
        onOk={() => onConfirm()}
        onCancel={() => closeModal()}
        width={500}
      >
        <TreeSelector
          treeData={treeData}
          onChange={(e) => setSelectVal(e?.[0])}
          selectedKeys={selectVal ? [selectVal] : []}
          multiple={false}
        ></TreeSelector>
      </Modal>
    </>
  )
}
