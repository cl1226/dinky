import { UploadOutlined } from '@ant-design/icons'
import { Button, Form, Input, message, Modal, Select, Upload, UploadFile } from 'antd'
import MonacoEditor from 'react-monaco-editor'
import type { DefaultOptionType } from 'antd/lib/select'
import { Dispatch, SetStateAction, useEffect } from 'react'
import { useRef, useState } from 'react'
import style from './index.less'
import type { TreeDataNode } from '@/components/Scheduler/SchedulerTree/Function'
import type { IAddFileParams } from '../service'
import { addFile } from '../service'
import type { UploadChangeParam } from 'antd/lib/upload'
import type { ITableDocumentItem } from './DocumentList'

interface IDialogProps {
  type: DialogType
  isModalOpen: boolean
  setIsModalOpen: Dispatch<SetStateAction<boolean>>
  catalogue: TreeDataNode
  onCreateSuccess?: () => void
  editRecord?: ITableDocumentItem
}

export enum DialogType {
  create = 'create',
  rename = 'rename',
  upload = 'upload',
}

const { TextArea } = Input

const normFile = (e: any) => {
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
  <Form.Item name="description" key="description" label="描述">
    <TextArea maxLength={200} placeholder="请输入描述" />
  </Form.Item>,
]

const opts: DefaultOptionType[] = [
  'txt',
  'log',
  'sh',
  'bat',
  ' conf',
  ' py',
  ' sql',
  'xml',
  'json',
  'yml',
  'yaml',
  'java',
  'js',
].map((i) => ({
  label: i,
  value: i,
}))

const Dialog = ({
  type,
  isModalOpen,
  setIsModalOpen,
  catalogue,
  onCreateSuccess,
  editRecord,
}: IDialogProps) => {
  const [form] = Form.useForm()
  const upload = useRef()
  const [uploading, setuploading] = useState(false)

  useEffect(() => {
    if (Object.keys(editRecord ?? {}).length > 0) {
      form.setFieldsValue({
        name: editRecord?.name,
        description: editRecord?.description,
      })
    }
  }, [editRecord])

  const uploadChange = ({ file }: UploadChangeParam) => {
    if (file.status === 'done') {
      form.setFieldValue('name', file.name)
      setuploading(false)
      if (file.response.code == 0) {
        message.success('文件上传成功')
      } else {
        upload.current.onError('文件上传失败', file.response, file)
      }
    } else if (file.status === 'uploading') {
      setuploading(true)
    } else if (file.status === 'error') {
      setuploading(false)
    }
  }

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
          name="fileType"
          key="fileType"
          label="文件格式"
          rules={[{ required: true, message: '请选择文件格式' }]}
        >
          <Select style={{ width: 200 }} options={opts} />
        </Form.Item>,
        <Form.Item name="description" key="description" label="描述">
          <TextArea maxLength={200} placeholder="请输入描述" />
        </Form.Item>,
        <Form.Item
          name="content"
          key="content"
          label="文件内容"
          rules={[{ required: true, message: '请输入资源内容' }]}
        >
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
        <Form.Item
          name="file"
          key="file"
          label="上传文件"
          rules={[{ required: true, message: '请输入资源内容' }]}
          valuePropName="fileList"
          getValueFromEvent={normFile}
        >
          <Upload
            name="file"
            action="/api/file/manage/upload"
            listType="text"
            data={{ type: 'File', catalogueId: catalogue?.id }}
            maxCount={1}
            ref={upload}
            onChange={uploadChange}
          >
            <Button icon={<UploadOutlined />}>上传文件</Button>
          </Upload>
        </Form.Item>,
        ...commonFormItems,
      ],
    },
  }

  const typeConfig = config[type]
  const isRename = type === DialogType.rename

  const handleOk = () => {
    if (uploading) {
      return
    }
    form
      .validateFields()
      .then((values) => {
        console.log(values)
        const params: IAddFileParams = {
          catalogueId: catalogue.id,
          type: 'File',
          name:
            type == DialogType.create && !values.name.endsWith('.' + values.fileType)
              ? `${values.name}.${values.fileType}`
              : values.name,
          filePath: values?.file?.[0]?.response?.datas,
          description: values.description,
          str: values.content,
          uploadType: isRename ? DialogType.upload : type,
          id: editRecord?.id,
        }
        addFile(params)
          .then((res) => {
            if (res.code == 0) {
              message.success(isRename ? '更新成功' : '文件创建成功')
              setIsModalOpen(false)
              onCreateSuccess?.()
            } else {
              throw res.msg
            }
          })
          .catch((err) => {
            message.error(err)
          })
      })
      .catch((info) => {
        console.log('Validate Failed:', info)
      })
  }

  const handleCancel = () => {
    if (uploading) {
      return
    }
    setIsModalOpen(false)
  }

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
        initialValues={{ content: '', fileType: 'sh' }}
      >
        {typeConfig.formItems}
      </Form>
    </Modal>
  )
}

export default Dialog
