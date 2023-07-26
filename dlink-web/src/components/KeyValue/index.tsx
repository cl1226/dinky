import React, { useEffect, useState } from 'react'
import { Button, Form, Space, Input, Popover, message } from 'antd'
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons'

export const KeyValue: React.FC<any> = (props) => {
  const {
    form,
    name,
    placeholder = ['请输入键名', '请输入键值'],
    rules = [[{ required: true, message: '请输入键名' }], []],
  } = props
  return (
    <Form.List name={name}>
      {(fields, { add, remove }) => (
        <>
          {fields.map(({ key, name, ...restField }, fieldIndex) => (
            <Space
              key={key}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                marginBottom: 8,
              }}
              align="baseline"
            >
              <Form.Item name={[name, 'key']} rules={rules[0]}>
                <Input placeholder={placeholder[0]} allowClear />
              </Form.Item>

              <Form.Item name={[name, 'value']} rules={rules[1]}>
                <Input placeholder={placeholder[1]} allowClear />
              </Form.Item>

              <MinusCircleOutlined style={{ marginTop: 8 }} onClick={() => remove(name)} />
            </Space>
          ))}
          <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
            添加 键值对
          </Button>
        </>
      )}
    </Form.List>
  )
}
