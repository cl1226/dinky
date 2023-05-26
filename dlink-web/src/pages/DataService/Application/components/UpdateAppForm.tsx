import React, { useState } from 'react'
import { Button, Form, Input, Modal, Space, Select, message } from 'antd'

import { AppDataItem } from '@/pages/DataService/Application/data.d'

import { l } from '@/utils/intl'
import { transferEnumToOptions } from '@/utils/utils'
import { ETokenExpire } from '@/utils/enum'
import { requestGetSecret } from '@/pages/DataService/Application/service'
import { CODE } from '@/components/Common/crud'
import { debounce } from 'lodash'

export type UpdateFormProps = {
  onCancel: (flag?: boolean, formVals?: Partial<AppDataItem>) => void
  onSubmit: (values: Partial<AppDataItem>) => void
  updateModalVisible: boolean
  isCreate: boolean
  values: Partial<AppDataItem>
}
const FormItem = Form.Item

const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
}

const UpdateAppForm: React.FC<UpdateFormProps> = (props) => {
  const [formVals, setFormVals] = useState<Partial<AppDataItem>>({
    id: props.values.id,
    name: props.values.name,
    secret: props.values.secret,
    description: props.values.description,
    expireDesc: props.values.expireDesc,
  })

  const [form] = Form.useForm()

  const {
    onSubmit: handleUpdate,
    onCancel: handleUpdateModalVisible,
    updateModalVisible,
    values,
    isCreate,
  } = props

  const submitForm = async () => {
    const fieldsValue = await form.validateFields()
    setFormVals({ ...formVals, ...fieldsValue })
    handleUpdate({ ...formVals, ...fieldsValue })
  }
  const handleCreateSecret = async () => {
    const result = await requestGetSecret()
    if (result.code === CODE.SUCCESS) {
      form.setFieldsValue({
        secret: result.datas,
      })
    } else {
      message.error(result.msg || '生成失败')
      form.setFieldsValue({
        secret: '',
      })
    }
  }
  const renderContent = () => {
    return (
      <>
        <FormItem
          name="name"
          label="App名称"
          rules={[{ required: true, message: '请输入App名称！' }]}
        >
          <Input placeholder="请输入App名称" />
        </FormItem>

        <FormItem label="密钥" rules={[{ required: true, message: '请生成密钥！' }]}>
          <Space.Compact style={{ width: '100%' }}>
            <FormItem name="secret" noStyle>
              <Input readOnly />
            </FormItem>

            <Button disabled={!isCreate} onClick={debounce(handleCreateSecret, 150)}>
              生成密钥
            </Button>
          </Space.Compact>
        </FormItem>

        <FormItem
          name="expireDesc"
          label="Token过期时间"
          rules={[{ required: true, message: '请选择Token过期时间！' }]}
        >
          <Select
            disabled={!isCreate}
            placeholder="请选择"
            style={{ width: 300 }}
            options={transferEnumToOptions(ETokenExpire)}
          ></Select>
        </FormItem>

        <FormItem name="description" label="描述">
          <Input.TextArea placeholder="请输入" style={{ resize: 'none' }} rows={4}></Input.TextArea>
        </FormItem>
      </>
    )
  }

  const renderFooter = () => {
    return (
      <>
        <Button onClick={() => handleUpdateModalVisible(false, values)}>
          {l('button.cancel')}
        </Button>
        <Button type="primary" onClick={() => submitForm()}>
          {l('button.finish')}
        </Button>
      </>
    )
  }

  return (
    <Modal
      width={640}
      bodyStyle={{ padding: '32px 40px 48px' }}
      destroyOnClose
      title={isCreate ? '创建新应用' : '编辑应用'}
      open={updateModalVisible}
      footer={renderFooter()}
      onCancel={() => handleUpdateModalVisible()}
    >
      <Form
        {...formLayout}
        form={form}
        initialValues={{
          id: formVals.id,
          name: formVals.name,
          secret: formVals.secret,
          description: formVals.description,
          expireDesc: formVals.expireDesc,
        }}
      >
        {renderContent()}
      </Form>
    </Modal>
  )
}

export default UpdateAppForm
