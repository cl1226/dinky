import { Table, Select, DatePicker, Form, Input, Row, Col, Button } from 'antd'
import { useEffect, useRef, useState } from 'react'

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
    const { list, total, pn, ps } = await getApplicationList(params)
    setLoading(false)
    setTableData(list)
    setPageTotal(total)
    setPageNum(pn)
    setPageSize(ps)
  }

  const onFinish = (values: any) => {
    console.log('Finish:', values)
  }

  const columns = [
    {
      title: '调用时间',
      dataIndex: 'description',
      key: 'description',
      width: 200,
    },
    {
      title: 'URL',
      dataIndex: 'description',
      key: 'description',
      width: 200,
    },
    {
      title: '调用时长',
      dataIndex: 'description',
      key: 'description',
      width: 200,
    },
    {
      title: '响应码',
      dataIndex: 'description',
      key: 'description',
      width: 200,
    },
    {
      title: '应用名称',
      dataIndex: 'description',
      key: 'description',
      width: 200,
    },
    {
      title: 'IP',
      dataIndex: 'description',
      key: 'description',
      width: 200,
    },
    {
      title: '错误信息',
      dataIndex: 'description',
      key: 'description',
      width: 200,
    },
  ]
  useEffect(() => {
    console.log('111')
    forceUpdate({})
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
          <Col span={6}>
            <Form.Item name="IP" label="日期">
              <RangePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="URL" label="URL">
              <Input placeholder="URL" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="IP" label="IP">
              <Input placeholder="IP" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="status" label="状态">
              <Select placeholder="请选择">
                <Select.Option value={200}>成功</Select.Option>
                <Select.Option value={500}>失败</Select.Option>
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
