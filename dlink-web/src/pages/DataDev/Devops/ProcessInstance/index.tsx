import React, { useCallback, useEffect, useState } from 'react'
import { Table, Popconfirm, Form, Row, Col, DatePicker, Input, Select, Button } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { history } from 'umi'
import PageWrap from '@/components/Common/PageWrap'
import {
  getProcessInstanceList,
  ProcessInstanceParams,
  updateProcessRerun,
  updateProcessStop,
  updateProcessPause,
  updateProcessSuspend,
} from '@/pages/DataDev/Devops/service'
import { EState, ECommandType } from '@/pages/DataDev/Devops/data.d'
import { transferEnumToOptions } from '@/utils/utils'
import SelectHelp from '@/components/SelectHelp'
import { EAsyncCode } from '@/components/SelectHelp/type.d'

const RangePicker: any = DatePicker.RangePicker

let timerId: any = null
const ProcessInstance: React.FC = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [pageNum, setPageNum] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [pageTotal, setPageTotal] = useState(0)
  const [processData, setProcessData] = useState([])

  const columns: ColumnsType<any> = [
    {
      title: '#',
      dataIndex: 'key',
      key: 'key',
      render: (text, record, index) => `${(pageNum - 1) * pageSize + index + 1}`,
      width: 50,
    },
    {
      title: '工作流实例名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <a onClick={() => history.push(`/dataDev/develop/dataJob?workflowId=${record.workflowId}`)}>
          {text}
        </a>
      ),
      width: 250,
    },
    {
      title: '状态',
      dataIndex: 'state',
      key: 'state',
      width: 100,
      render: (text) => EState[text],
    },
    {
      title: '运行类型',
      dataIndex: 'commandType',
      key: 'commandType',
      width: 100,
      render: (text) => ECommandType[text],
    },
    {
      title: '调度时间',
      dataIndex: 'scheduleTime',
      key: 'scheduleTime',
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
      title: '运行次数',
      dataIndex: 'maxTryTimes',
      key: 'maxTryTimes',
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
      width: 200,
      render: (_, record) => {
        const { state } = record

        const rerunDisabled =
          state !== 'SUCCESS' && state !== 'PAUSE' && state !== 'FAILURE' && state !== 'STOP'

        const suspendStopDisabled = state !== 'RUNNING_EXECUTION' && state !== 'STOP'
        const suspendStopText = state === 'STOP' ? '恢复运行' : '停止'
        const suspendPauseDisabled = state !== 'RUNNING_EXECUTION' && state !== 'PAUSE'
        const suspendPauseText = state === 'PAUSE' ? '恢复运行' : '暂停'
        return (
          <>
            <Popconfirm
              title="请确认将执行重跑操作！"
              placement="bottom"
              onConfirm={() => onConfirmBtn('rerun', record.id)}
              disabled={rerunDisabled}
            >
              <Button type="link" size={'small'} disabled={rerunDisabled}>
                重跑
              </Button>
            </Popconfirm>

            <Popconfirm
              title={`请确认将执行${suspendStopText}操作！`}
              placement="bottom"
              disabled={suspendStopDisabled}
              onConfirm={() =>
                onConfirmBtn(record.state === 'STOP' ? 'suspend' : 'stop', record.id)
              }
            >
              <Button type="link" size={'small'} disabled={suspendStopDisabled}>
                {suspendStopText}
              </Button>
            </Popconfirm>

            <Popconfirm
              title={`请确认将执行${suspendPauseText}操作！`}
              placement="bottom"
              disabled={suspendPauseDisabled}
              onConfirm={() =>
                onConfirmBtn(record.state === 'PAUSE' ? 'suspend' : 'pause', record.id)
              }
            >
              <Button type="link" size={'small'} disabled={suspendPauseDisabled}>
                {suspendPauseText}
              </Button>
            </Popconfirm>
          </>
        )
      },
    },
  ]

  const onConfirmBtn = async (type, processInstanceId) => {
    const apiMaps = {
      rerun: updateProcessRerun,
      stop: updateProcessStop,
      pause: updateProcessPause,
      suspend: updateProcessSuspend,
    }
    const projectCode = await form.getFieldValue('projectCode')
    setLoading(true)
    const result = await apiMaps[type](processInstanceId, projectCode)
    if (result) {
      getProcessList()
    } else {
      setLoading(false)
    }
  }
  const getProcessList = async (extra?: ProcessInstanceParams) => {
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
    const { list, total, pn, ps } = await getProcessInstanceList(params)
    setLoading(false)
    setProcessData(list)
    setPageTotal(total)
    setPageNum(pn)
    setPageSize(ps)

    clearTimeout(timerId)
    timerId = setTimeout(() => {
      getProcessList(params)
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
          getProcessList({
            pageNo: 1,
            pageSize: 10,
          })
        }}
        style={{ marginBottom: 20 }}
      >
        <Row>
          <Col span={8} style={{"display": "none"}}>
            <Form.Item name="projectCode" label="项目">
              <SelectHelp
                placeholder="请选择"
                asyncCode={EAsyncCode.rootCatalogue}
                defaultSelectFirst={true}
                afterAsync={(options) => {
                  getProcessList({
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
        dataSource={processData}
        loading={loading}
        scroll={{ x: 1500 }}
        size="small"
        rowKey={'id'}
        pagination={{
          current: pageNum,
          pageSize: pageSize,
          size: 'small',
          onChange: (pn, ps) => {
            getProcessList({
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

export default ProcessInstance
