import React, { useState } from 'react'
import { Button, Form, Space, Modal, Input, Select, Table } from 'antd'
import { l } from '@/utils/intl'
import { transferEnumToOptions, getEnumLabel } from '@/utils/utils'

export enum EDataType {
  'string' = 'string',
  'bigint' = 'bigint',
  'double' = 'double',
  'date' = 'date',
  'string 数组' = 'Array<string>',
  'bigint 数组' = 'Array<bigint>',
  'double 数组' = 'Array<double>',
  'date 数组' = 'Array<date>',
}

const formLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
}

export type IParametersJson = {
  name?: string
  type?: EDataType
  description?: string
}

export default (props) => {
  const { value, onChange, style } = props
  const defaultValue = JSON.parse(value || '[]')
  const [visible, setVisible] = useState(false)
  const [form] = Form.useForm()
  const [isCreate, setIsCreate] = useState(true)
  const [paramList, setParamList] = useState<IParametersJson[]>(defaultValue)
  const onAdd = () => {
    form.setFieldsValue({
      name: '',
      type: '',
      description: '',
    })
    setIsCreate(true)
    setVisible(true)
  }

  const submitForm = async () => {
    const fieldsValue = await form.validateFields()

    if (isCreate) {
      const tempList = [...paramList, fieldsValue]
      setParamList(tempList)
      onChange(JSON.stringify(tempList))
      setVisible(false)
    }
  }

  const renderFooter = () => {
    return (
      <>
        <Button
          onClick={() => {
            setVisible(false)
          }}
        >
          {l('button.cancel')}
        </Button>
        <Button type="primary" onClick={() => submitForm()}>
          {l('button.finish')}
        </Button>
      </>
    )
  }
  const renderContent = () => {
    return (
      <>
        <Form.Item
          name="name"
          label="参数名"
          extra={`支持英文，数字，点，中划线，下划线，且只能以英文开头，1-32字符。`}
          rules={[{ required: true, message: '请输入参数名！' }]}
        >
          <Input placeholder="请输入参数名" />
        </Form.Item>

        <Form.Item label="类型" name="type" rules={[{ required: true, message: '请选择类型！' }]}>
          <Select options={transferEnumToOptions(EDataType)}></Select>
        </Form.Item>

        <Form.Item label="描述" name="description">
          <Input.TextArea rows={4} maxLength={255} showCount={true}></Input.TextArea>
        </Form.Item>
      </>
    )
  }
  const columns = [
    {
      title: '参数名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      render: (cellValue, record) => {
        return getEnumLabel(cellValue, EDataType)
      },
    },
  ]
  const renderTable = () => {
    if (paramList && paramList.length) {
      return <Table dataSource={paramList} columns={columns} />
    }
    return null
  }
  return (
    <>
      <Space.Compact style={style}>
        <Button onClick={onAdd}>添加</Button>
        <span
          style={{
            display: 'inline-block',
            lineHeight: '32px',
            marginLeft: 10,
            color: '#999',
            fontSize: 12,
          }}
        >
          请求中的所有参数，包括Path中的动态参数、Header参数、Query参数、Body参数，名称保证唯一。
        </span>
      </Space.Compact>
      {renderTable()}
      <Modal
        width={640}
        bodyStyle={{ padding: '32px 40px 48px' }}
        destroyOnClose
        title={'添加入参'}
        open={visible}
        footer={renderFooter()}
        onCancel={() => setVisible(false)}
      >
        <Form {...formLayout} form={form}>
          {renderContent()}
        </Form>
      </Modal>
    </>
  )
}
