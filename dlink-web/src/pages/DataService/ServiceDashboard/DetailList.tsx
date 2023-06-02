import { Table, Select, DatePicker, Form, Input, Row, Col, Button } from 'antd'
import { useEffect, useRef, useState } from 'react'
import { getSummaryDetailList } from '@/pages/DataService/ServiceDashboard/service'
import moment from 'moment'
const RangePicker: any = DatePicker.RangePicker

export default () => {
  const [form] = Form.useForm()
  const [, forceUpdate] = useState({})

  const [pageNum, setPageNum] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [pageTotal, setPageTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  const [tableData, setTableData] = useState([])

  const getTableList = async (extra?: any) => {
    const params = {
      pageIndex: pageNum,
      pageSize: pageSize,
      ...(extra || {}),
    }

    setLoading(true)
    const { list, total, pn, ps } = await getSummaryDetailList(params)
    setLoading(false)
    setTableData(list)
    setPageTotal(total)
    setPageNum(pn)
    setPageSize(ps)
  }

  const onFinish = (values: any) => {
    console.log('Finish:', values)
    const { dateRange, url, status } = values
    const [beginDate, endDate] = dateRange || []
    getTableList({
      url: url || '',
      status: status,
      beginDate: beginDate ? beginDate.format('YYYY-MM-DD') : '',
      endDate: endDate ? endDate.add(1, 'day').format('YYYY-MM-DD') : '',
      pageIndex: 1,
      pageSize: 10,
    })
  }

  const columns = [
    {
      title: '调用时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 200,
    },
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      width: 200,
    },
    {
      title: '调用时长',
      dataIndex: 'duration',
      key: 'duration',
      width: 200,
    },
    {
      title: '响应码',
      dataIndex: 'status',
      key: 'status',
      width: 200,
    },
    {
      title: 'IP',
      dataIndex: 'ip',
      key: 'ip',
      width: 200,
    },
    {
      title: '错误信息',
      dataIndex: 'error',
      key: 'error',
      width: 200,
    },
  ]
  useEffect(() => {
    forceUpdate({})
    getTableList()
  }, [])

  return (
    <>
      <Form
        form={form}
        labelCol={{ flex: '70px' }}
        labelAlign={'right'}
        labelWrap={true}
        wrapperCol={{ flex: 1 }}
        name="form-search"
        onFinish={onFinish}
      >
        <Row>
          <Col span={8}>
            <Form.Item name="dateRange" label="日期">
              <RangePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="url" label="URL">
              <Input placeholder="URL" allowClear={true} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="status" label="状态">
              <Select placeholder="请选择" allowClear={true}>
                <Select.Option value={1}>成功</Select.Option>
                <Select.Option value={0}>失败</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row>
          <Col span={24} style={{ textAlign: 'right' }}>
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
        style={{ marginTop: 10 }}
        loading={loading}
        rowKey="id"
        size="small"
        columns={columns}
        dataSource={tableData}
        pagination={{
          current: pageNum,
          pageSize: pageSize,
          size: 'small',
          onChange: (pn, ps) => {
            getTableList({
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
    </>
  )
}
