import type { NsJsonSchemaForm } from '@antv/xflow'
import React from 'react'
import { Form } from 'antd'
import { FormItemWrapper } from '@antv/xflow'

export const SpanShape: React.FC<NsJsonSchemaForm.IControlProps> = props => {
  const { controlSchema } = props
  const { required, tooltip, extra, name, label, placeholder } = controlSchema
  return (
    <FormItemWrapper schema={controlSchema}>
    {({ disabled, hidden, initialValue }) => {
      return (
        <Form.Item
          name={name}
          label={label}
          initialValue={initialValue}
          tooltip={tooltip}
          extra={extra}
          required={required}
          hidden={hidden}
        >
          <span>{controlSchema.value}</span>
        </Form.Item>
      )
    }}
  </FormItemWrapper>
  )
}
