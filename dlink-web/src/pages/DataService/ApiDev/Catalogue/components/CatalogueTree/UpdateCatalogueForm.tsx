import React, { useState } from 'react'
import { Button, Form, Input, Modal } from 'antd'

import type { CatalogueTableListItem } from '@/pages/DataService/ApiDev/Catalogue/data.d'
import { l } from '@/utils/intl'

export type UpdateFormProps = {
  onCancel: (flag?: boolean, formVals?: Partial<CatalogueTableListItem>) => void
  onSubmit: (values: Partial<CatalogueTableListItem>) => void
  updateModalVisible: boolean
  isCreate: boolean
  values: Partial<CatalogueTableListItem>
}
const FormItem = Form.Item

const formLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 13 },
}

const UpdateCatalogueForm: React.FC<UpdateFormProps> = (props) => {
  const [formVals, setFormVals] = useState<Partial<CatalogueTableListItem>>({
    id: props.values.id,
    name: props.values.name,
    isLeaf: props.values.isLeaf,
    parentId: props.values.parentId,
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

  const renderContent = () => {
    return (
      <>
        <FormItem
          name="name"
          label="目录名称"
          extra="支持汉字，英文，数字，下划线，且以英文、汉字以及数字开头，1~64个字符。"
          rules={[{ required: true, message: '请输入目录名称！' }]}
        >
          <Input placeholder="请输入目录名称" />
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
      title={isCreate ? '创建新目录' : '重命名目录-' + formVals.name}
      visible={updateModalVisible}
      footer={renderFooter()}
      onCancel={() => handleUpdateModalVisible()}
    >
      <Form
        {...formLayout}
        form={form}
        initialValues={{
          id: formVals.id,
          taskId: formVals.taskId,
          name: formVals.name,
          isLeaf: formVals.isLeaf,
          parentId: formVals.parentId,
        }}
      >
        {renderContent()}
      </Form>
    </Modal>
  )
}

export default UpdateCatalogueForm
