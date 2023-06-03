import React, { useCallback, useEffect, useState } from 'react';
import { Space, Table, Tag } from 'antd';
import type { ColumnsType, TablePaginationConfig  } from 'antd/es/table';
import { PageContainer } from '@ant-design/pro-layout'
import type { FilterValue, SorterResult } from 'antd/es/table/interface';
import {
  getProcessInstanceList,
  getTaskInstanceList,
  ProcessInstanceParams
} from '@/pages/DataDev/Devops/service'

interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
  tags: string[];
}

interface TableParams {
  pagination?: TablePaginationConfig;
  sortField?: string;
  sortOrder?: string;
  filters?: Record<string, FilterValue>;
}

const columns: ColumnsType<DataType> = [
  {
    title: '#',
    dataIndex: 'key',
    key: 'key',
    render: (text, record, index) => `${index + 1}`,
  },
  {
    title: '任务名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '工作流实例',
    dataIndex: 'processInstanceName',
    key: 'processInstanceName',
  },
  {
    title: '节点类型',
    dataIndex: 'taskType',
    key: 'taskType',
  },
  {
    title: '状态',
    dataIndex: 'state',
    key: 'state',
  },
  {
    title: '提交时间',
    dataIndex: 'submitTime',
    key: 'submitTime',
  },
  {
    title: '开始时间',
    dataIndex: 'startTime',
    key: 'startTime',
  },
  {
    title: '结束时间',
    dataIndex: 'endTime',
    key: 'endTime',
  },
  {
    title: '运行时间',
    dataIndex: 'duration',
    key: 'duration',
  },
  {
    title: '重试次数',
    dataIndex: 'retryTimes',
    key: 'retryTimes',
  },
  {
    title: '主机',
    dataIndex: 'host',
    key: 'host',
  },
  {
    title: '操作',
    key: 'action',
    fixed: 'right',
    render: (_, record) => (
      <Space size="middle">
        <a>Invite</a>
        <a>Delete</a>
      </Space>
    ),
  },
];


const TaskInstance: React.FC = () => {

  const [loading, setLoading] = useState(false);
  const [searchVal, setSearchVal] = useState('')
  const [pageNum, setPageNum] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [pageTotal, setPageTotal] = useState(0)
  const [taskData, setTaskData] = useState([])

  const getTaskList = async (extra?: ProcessInstanceParams) => {
    const params: ProcessInstanceParams = {
      pageNo: pageNum,
      pageSize: pageSize,
      searchVal: searchVal,
      projectCode: 9529772328832,
      ...(extra || {}),
    }

    setLoading(true)
    const { list, total, pn, ps } = await getTaskInstanceList(params)
    setLoading(false)
    setTaskData(list)
    setPageTotal(total)
    setPageNum(pn)
    setPageSize(ps)
  }

  const onTaskNameChange = (e) => {
    setSearchVal(e.target.value)
  }

  useEffect(() => {
    const sessionJson = sessionStorage.getItem('dataDev.devops.process.list')
    const sessionQuery = JSON.parse(sessionJson || '{}')
    getTaskList(sessionQuery)
    sessionStorage.removeItem('dataDev.devops.process.list')
  }, [])

  return (
    <PageContainer title={false}>
      <Table 
      columns={columns} 
      dataSource={taskData} 
      loading={loading}
      pagination={{
        current: pageNum,
        pageSize: pageSize,
        size: 'small',
        onChange: (pn, ps) => {
            getTaskList({
            pageNo: pn,
            pageSize: ps,
          })
        },
        total: pageTotal,
        showTotal: (total) => `共 ${total} 条`,
        showSizeChanger: true,
        showQuickJumper: true,
      }}
      />
    </PageContainer>
  )
}

export default TaskInstance;