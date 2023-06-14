import React, { useCallback, useEffect, useState } from 'react'
import { Modal, Space, Table, Spin, Form, Row, Col, DatePicker, Input, Select, Button } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { history } from 'umi'
import PageWrap from '@/components/Common/PageWrap'
import {
  requestTaskLog,
  getTaskInstanceList,
  ProcessInstanceParams,
} from '@/pages/DataDev/Devops/service'
import { EState, ECommandType } from '@/pages/DataDev/Devops/data.d'

import { transferEnumToOptions } from '@/utils/utils'
import SelectHelp from '@/components/SelectHelp'
import { EAsyncCode } from '@/components/SelectHelp/type.d'

const RangePicker: any = DatePicker.RangePicker

let timerId: any = null

const TaskInstance: React.FC = () => {
  const [form] = Form.useForm()
  const [logModalVisible, setLogModalVisible] = useState(false)
  const [logText, setLogText] = useState('')
  const [logId, setLogId] = useState<any>(null)
  const [logLoading, setLogLoading] = useState(false)
  const [loading, setLoading] = useState(false)
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
      render: (text, record) => (
        <a onClick={() => history.push(`/dataDev/develop/dataStudio?taskId=${record.taskId}`)}>
          {text}
        </a>
      ),
      width: 200,
    },
    {
      title: '工作流实例',
      dataIndex: 'processInstanceName',
      key: 'processInstanceName',
      render: (text, record) => (
        <a onClick={() => history.push(`/dataDev/develop/dataJob?workflowId=${record.workflowId}`)}>
          {text}
        </a>
      ),
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
      width: 100,
      render: (_, record) => (
        <>
          <Button
            type="link"
            size={'small'}
            onClick={async () => {
              setLogModalVisible(true)
              setLogId(record.id)
              setLogLoading(true)
              const res = await requestTaskLog(record.id)
              setLogLoading(false)
              const { datas } = res
              setLogText(datas?.message)
            }}
          >
            查看日志
          </Button>
        </>
      ),
    },
  ]

  const getTaskList = async (extra?: ProcessInstanceParams) => {
    const fieldsValue = await form.getFieldsValue()
    const { dateRange, stateType, name, projectCode } = fieldsValue
    const [startDate, endDate] = dateRange || []

    const params: ProcessInstanceParams = {
      pageNo: pageNum,
      pageSize: pageSize,
      projectCode: projectCode,
      stateType,
      searchVal: name || '',
      startDate: startDate ? startDate.format('YYYY-MM-DD HH:mm:ss') : '',
      endDate: endDate ? endDate.format('YYYY-MM-DD HH:mm:ss') : '',
      ...(extra || {}),
    }

    setLoading(true)
    const { list, total, pn, ps } = await getTaskInstanceList(params)
    setLoading(false)
    setTaskData(list)
    setPageTotal(total)
    setPageNum(pn)
    setPageSize(ps)

    clearTimeout(timerId)
    timerId = setTimeout(() => {
      getTaskList(params)
    }, 10000)
  }

  useEffect(() => {
    return () => {
      clearTimeout(timerId)
    }
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
        onFinish={() => {
          getTaskList({
            pageNo: 1,
            pageSize: 10,
          })
        }}
        style={{ marginBottom: 20 }}
      >
        <Row>
          <Col span={8}>
            <Form.Item name="projectCode" label="项目">
              <SelectHelp
                placeholder="请选择"
                asyncCode={EAsyncCode.rootCatalogue}
                defaultSelectFirst={true}
                afterAsync={(options) => {
                  getTaskList({
                    pageNo: 1,
                    pageSize: 10,
                    projectCode: options[0]?.value,
                  })
                }}
                optionFormatter={(options) =>
                  options.map((item) => ({
                    value: item.projectCode,
                    label: item.name,
                  }))
                }
              ></SelectHelp>
            </Form.Item>
          </Col>

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

      <Modal
        title="查看日志"
        open={logModalVisible}
        width={1000}
        footer={[
          <Button
            key="refresh"
            onClick={async () => {
              if (!logId) return
              setLogLoading(true)
              const res = await requestTaskLog(logId)
              setLogLoading(false)
              const { datas } = res
              setLogText(datas?.message)
            }}
          >
            刷新
          </Button>,
          <Button
            key="close"
            onClick={() => {
              setLogModalVisible(false)
              setLogText('')
            }}
          >
            关闭
          </Button>,
        ]}
        onCancel={() => {
          setLogModalVisible(false)
          setLogText('')
        }}
      >
        <Spin spinning={logLoading}>
          <Input.TextArea
            value={logText}
            readOnly
            autoSize={{ minRows: 30, maxRows: 30 }}
          ></Input.TextArea>
        </Spin>
      </Modal>
    </PageWrap>
  )
}

export default TaskInstance
