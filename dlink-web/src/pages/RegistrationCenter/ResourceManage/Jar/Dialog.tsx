import { UploadOutlined } from '@ant-design/icons'
import { Button, Form, Input, Modal, Select, Upload } from 'antd'
import MonacoEditor from 'react-monaco-editor'
import type { DefaultOptionType } from 'antd/lib/select'
import type { Dispatch, SetStateAction } from 'react'
import style from './index.less'
interface IDialogProps {
  type: DialogType
  isModalOpen: boolean
  setIsModalOpen: Dispatch<SetStateAction<boolean>>
}

export enum DialogType {
  create = 'create',
  rename = 'rename',
  upload = 'upload',
}

const { TextArea } = Input

const normFile = (e: any) => {
  console.log('Upload event:', e)
  if (Array.isArray(e)) {
    return e
  }
  return e?.fileList
}

const commonFormItems = [
  <Form.Item
    name="name"
    key="name"
    label="文件名称"
    rules={[{ required: true, message: '请输入文件名称' }]}
  >
    <Input placeholder="请输入名称" />
  </Form.Item>,
  <Form.Item name="desc" key="desc" label="描述">
    <TextArea maxLength={200} placeholder="请输入描述" />
  </Form.Item>,
]

const opts: DefaultOptionType[] = [
  {
    value: 'lucy',
    label: 'Lucy',
  },
]

const config = {
  create: {
    title: '创建文件',
    formItems: [
      <Form.Item
        name="name"
        key="name"
        label="文件名称"
        rules={[{ required: true, message: '请输入文件名称' }]}
      >
        <Input placeholder="请输入名称" />
      </Form.Item>,
      <Form.Item
        name="type"
        key="type"
        label="文件格式"
        rules={[{ required: true, message: '请选择文件格式' }]}
        initialValue={{ type: 'lucy' }}
      >
        <Select style={{ width: 200 }} options={opts} />
      </Form.Item>,
      <Form.Item name="desc" key="desc" label="描述">
        <TextArea maxLength={200} placeholder="请输入描述" />
      </Form.Item>,
      <Form.Item name="content" key="content" label="文件内容" rules={[{ required: true, message: '请输入资源内容' }]}>
        <MonacoEditor
          className={style.editor}
          height="200"
          theme="vs"
          language="java"
          options={{
            automaticLayout: true,
            selectOnLineNumbers: true,
          }}
        />
      </Form.Item>,
    ],
  },
  rename: {
    title: '重命名',
    formItems: [...commonFormItems],
  },
  upload: {
    title: '上传文件',
    formItems: [
      ...commonFormItems,
      <Form.Item
        name="file"
        key="file"
        label="上传文件"
        rules={[{ required: true, message: '请输入资源内容' }]}
        valuePropName="fileList"
        getValueFromEvent={normFile}
      >
        <Upload name="logo" action="/upload.do" listType="text" maxCount={1}>
          <Button icon={<UploadOutlined />}>上传文件</Button>
        </Upload>
      </Form.Item>,
    ],
  },
}

const Dialog = ({ type, isModalOpen, setIsModalOpen }: IDialogProps) => {
  const [form] = Form.useForm()
  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        console.log(values)

        // form.resetFields()
        // onCreate(values)
        setIsModalOpen(false)
      })
      .catch((info) => {
        console.log('Validate Failed:', info)
      })
  }

  const handleCancel = () => {
    setIsModalOpen(false)
  }

  const typeConfig = config[type]

  return (
    <Modal
      title={typeConfig.title}
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      maskClosable={false}
      destroyOnClose
      width={type == DialogType.create ? '50%' : '40%'}
    >
      <Form
        form={form}
        preserve={false}
        layout="vertical"
        name="form_in_modal"
        initialValues={{ content: '' }}
      >
        {typeConfig.formItems}
      </Form>
    </Modal>
  )
}

export default Dialog
