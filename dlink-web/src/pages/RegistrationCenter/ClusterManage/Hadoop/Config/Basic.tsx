import React, { useEffect, useRef, useState } from 'react'
import styles from './index.less'
import { Form, Radio, Input, Collapse, Button, Upload } from 'antd'
import { EHadoopType, ETrueFalse } from '@/utils/enum'
import { transferEnumToOptions } from '@/utils/utils'
import { UploadOutlined } from '@ant-design/icons'

import { formLayout } from '../data.d'

const BasicTab: React.FC<{ mode: 'create' | 'view' | 'edit' }> = (props: any) => {
  const [basicForm] = Form.useForm()
  const [configForm] = Form.useForm()
  const [kerberosForm] = Form.useForm()
  const [configLoaded, setConfigLoaded] = useState(false)
  const [collapseKey, setCollapseKey] = useState<any>(['hadoop', 'Kerberos'])
  const onLoadConfig = () => {
    setConfigLoaded(true)
    setCollapseKey([...collapseKey, 'config'])
  }
  useEffect(() => {}, [])
  return (
    <Collapse
      className={styles['collapse-wrap']}
      bordered={false}
      activeKey={collapseKey}
      onChange={(key: string | string[]) => {
        setCollapseKey(key)
      }}
    >
      <Collapse.Panel header="Hadoop 平台" key="hadoop">
        <Form {...formLayout} form={basicForm} name="basic-form" initialValues={{}}>
          <Form.Item label="Hadoop 平台类型" name="hadoopType">
            <Radio.Group
              options={transferEnumToOptions(EHadoopType)}
              optionType="button"
              buttonStyle="solid"
            />
          </Form.Item>
          <Form.Item label="名称" name="name" rules={[{ required: true, message: '请输入名称！' }]}>
            <Input placeholder="请输入名称" style={{ width: 500 }} />
          </Form.Item>
          <Form.Item label="地址" name="ip" rules={[{ required: true, message: '请输入地址！' }]}>
            <Input placeholder="请输入地址" style={{ width: 500 }} />
          </Form.Item>
          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: '请输入用户名！' }]}
          >
            <Input placeholder="请输入用户名" style={{ width: 500 }} />
          </Form.Item>
          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: '请输入密码！' }]}
          >
            <Input placeholder="请输入密码" style={{ width: 500 }} />
          </Form.Item>
          <Form.Item>
            <Button onClick={onLoadConfig}>加载配置</Button>
          </Form.Item>
        </Form>
      </Collapse.Panel>
      {configLoaded ? (
        <Collapse.Panel header="配置信息" key="config">
          222
        </Collapse.Panel>
      ) : null}

      <Collapse.Panel header="Kerberos认证" key="kerberos">
        <Form {...formLayout} form={kerberosForm} name="kerberos-form" initialValues={{}}>
          <Form.Item label="是否启用Kerberos" name="truefalse">
            <Radio.Group options={transferEnumToOptions(ETrueFalse)} />
          </Form.Item>
          <Form.Item
            label="krbConf文件"
            name="krbConfFile"
            valuePropName="fileList"
            getValueFromEvent={(e: any) => {
              console.log('Upload event:', e)
              if (Array.isArray(e)) {
                return e
              }
              return e?.fileList
            }}
          >
            <Upload>
              <Button icon={<UploadOutlined />}>点击上传</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Collapse.Panel>
    </Collapse>
  )
}

export default BasicTab
