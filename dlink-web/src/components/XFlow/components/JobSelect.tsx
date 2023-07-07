import React, { useEffect, useState } from 'react'
import { Row, Space, Input, Modal, message, Table } from 'antd'
import { CloseCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { Scrollbars } from 'react-custom-scrollbars'
import type { ColumnsType } from 'antd/es/table'
import { getJobList, getTask } from '@/pages/DataStudio/service'
import { debounce } from 'lodash'
import { IGetShellListParams } from '@/components/Studio/StudioEdit/data'

const { Search } = Input

export interface TaskTableItem {
  id: number
  name: string
  type: string
  createTime: string
  updateTime: string
  path: string
}
// valueKey: id Object
export const JobSelect: React.FC<any> = (props) => {
  const { value, valueKey = 'id', onChange, placeholder = '请选择关联脚本', ...resetProps } = props

  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [searchKey, setSearchKey] = useState('')

  const [pageNum, setPageNum] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [pageTotal, setPageTotal] = useState(0)

  const [shellData, setShellData] = useState([])

  const [selectedRows, setSelectedRows] = useState<TaskTableItem[]>([])

  const getShellList = async (extra?: any) => {
    const params: IGetShellListParams = {
      pageIndex: pageNum,
      pageSize: pageSize,
      name: searchKey || '',
      dialect: '',
      ...(extra || {}),
    }

    setLoading(true)
    const result = await getJobList(params)
    setLoading(false)
    setShellData(result.datas.records)
    setPageTotal(result.datas.total)
    setPageNum(result.datas.current)
    setPageSize(result.datas.size)
  }
  const chooseShell = () => {
    if (selectedRows && selectedRows.length) {
      const tempVal = valueKey === 'Object' ? selectedRows[0] : selectedRows[0][valueKey]
      onChange && onChange(tempVal)
      closeModal()
    } else {
      message.error('请选择关联的脚本')
    }
  }
  const closeModal = () => {
    setShowModal(false)
    setSelectedRows([])
    setShellData([])
  }
  const columns: ColumnsType<TaskTableItem> = [
    {
      title: '脚本名称',
      dataIndex: 'name',
      key: 'name',
      width: 240,
    },
    {
      title: '脚本类型',
      dataIndex: 'dialect',
      key: 'dialect',
      width: 80,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 150,
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: 150,
    },
    {
      title: '路径',
      dataIndex: 'path',
      key: 'path',
      width: 200,
    },
  ]

  return (
    <>
      <Input
        placeholder={placeholder}
        value={valueKey === 'Object' ? value?.name : value}
        suffix={<PlusOutlined />}
        onClick={() => {
          setShowModal(true)
          getShellList({
            pageIndex: 1,
            pageSize: 10,
          })
        }}
        {...resetProps}
      ></Input>

      <Modal
        title="关联脚本"
        centered
        open={showModal}
        onOk={() => chooseShell()}
        onCancel={() => closeModal()}
        width={960}
      >
        <Scrollbars style={{ height: 450 }}>
          <Row style={{ marginBottom: 10 }} justify={'end'}>
            <Search
              placeholder="请输入脚本名称"
              onSearch={() => {
                getShellList({
                  pageIndex: 1,
                  pageSize: 10,
                })
              }}
              onChange={(e) => {
                setSearchKey(e.target.value)
              }}
              style={{ width: 200 }}
            />
          </Row>
          <Table
            rowSelection={{
              type: 'radio',
              onChange: (selectedRowKeys: React.Key[], selectedRows: TaskTableItem[]) => {
                setSelectedRows(selectedRows)
              },
              selectedRowKeys: selectedRows.map((item) => item.id),
            }}
            rowKey="id"
            loading={loading}
            columns={columns}
            dataSource={shellData}
            scroll={{ y: 300 }}
            size="small"
            pagination={{
              current: pageNum,
              pageSize: pageSize,
              size: 'small',
              onChange: (pn, ps) => {
                getShellList({
                  pageIndex: pn,
                  pageSize: ps,
                })
              },
              total: pageTotal,
              showTotal: (total) => `共 ${total} 条`,
              showSizeChanger: true,
              showQuickJumper: true,
            }}
          />
        </Scrollbars>
      </Modal>
    </>
  )
}
