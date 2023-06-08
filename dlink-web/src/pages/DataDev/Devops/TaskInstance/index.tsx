import React, { useCallback, useEffect, useState } from 'react'
import { Space, Table, Popconfirm, Form, Row, Col, DatePicker, Input, Select, Button } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import PageWrap from '@/components/Common/PageWrap'
import {
  getProcessInstanceList,
  getTaskInstanceList,
  ProcessInstanceParams,
} from '@/pages/DataDev/Devops/service'
import { EState, ECommandType } from '@/pages/DataDev/Devops/data.d'
import moment from 'moment'
import type { Moment } from 'moment'
import { transferEnumToOptions } from '@/utils/utils'
const RangePicker: any = DatePicker.RangePicker
type RangeValue = [Moment, Moment]

const TaskInstance: React.FC = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [searchVal, setSearchVal] = useState('')
  const [pageNum, setPageNum] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [pageTotal, setPageTotal] = useState(0)
  const [taskData, setTaskData] = useState([])

  const columns: ColumnsType<any> = [
    {
      title: '#',
      dataIndex: 'key',
      key: 'key',
      render: (text, record, index) => `${(pageNum - 1) * pageSize + index + 1}`,
      width: 50,
    },
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '工作流实例',
      dataIndex: 'processInstanceName',
      key: 'processInstanceName',
      render: (text,record) => <a>{text}</a>,
      width: 250,
    },
    {
      title: '节点类型',
      dataIndex: 'taskType',
      key: 'taskType',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'state',
      key: 'state',
      width: 100,
      render: (text) => EState[text],
    },
    {
      title: '提交时间',
      dataIndex: 'submitTime',
      key: 'submitTime',
      width: 180,
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 180,
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 180,
    },
    {
      title: '运行时长',
      dataIndex: 'duration',
      key: 'duration',
      width: 120,
    },
    {
      title: '重试次数',
      dataIndex: 'retryTimes',
      key: 'retryTimes',
      width: 80,
    },
    {
      title: '主机',
      dataIndex: 'host',
      key: 'host',
      width: 120,
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <a>查看日志</a>
          <a>下载</a>
        </Space>
      ),
    },
  ]

  const getTaskList = async (extra?: ProcessInstanceParams) => {
    const params: ProcessInstanceParams = {
      pageNo: pageNum,
      pageSize: pageSize,
      searchVal: '',
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

  const onFinish = (values: any) => {
    console.log('Finish:', values)
    const { dateRange, stateType, name } = values
    const [startDate, endDate] = dateRange || []
    getTaskList({
      stateType,
      searchVal: name,
      startDate: startDate.format('YYYY-MM-DD HH:mm:ss'),
      endDate: endDate.format('YYYY-MM-DD HH:mm:ss'),
      pageNo: 1,
      pageSize: 10,
    })
  }

  useEffect(() => {
    getTaskList()
  }, [])

  return (
    <PageWrap>
      <Form
        form={form}
        labelCol={{ flex: '70px' }}
        labelAlign={'right'}
        labelWrap={true}
        wrapperCol={{ flex: 1 }}
        name="form-search"
        onFinish={onFinish}
        style={{ marginBottom: 20 }}
      >
        <Row>
          <Col span={8}>
            <Form.Item name="name" label="名称">
              <Input placeholder="名称" allowClear={true} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="stateType" label="状态">
              <Select
                placeholder="请选择"
                allowClear={true}
                options={transferEnumToOptions(EState)}
              ></Select>
            </Form.Item>
          </Col>
        </Row>

        <Row>
          <Col span={12}>
            <Form.Item name="dateRange" label="时间">
              <RangePicker placeholder={['开始时间', '结束时间']} showTime />
            </Form.Item>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Button type="primary" htmlType="submit">
              查询
            </Button>
            <Button
              style={{ marginLeft: 8 }}
              onClick={() => {
                form.resetFields()
              }}
            >
              重置
            </Button>
          </Col>
        </Row>
      </Form>

      <Table
        columns={columns}
        dataSource={taskData}
        loading={loading}
        scroll={{ x: 1500 }}
        size="small"
        rowKey={'id'}
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
    </PageWrap>
  )
}

export default TaskInstance
