import React, { useEffect, useState } from 'react'
import styles from './index.less'
import {
  Form,
  Radio,
  Input,
  Collapse,
  Button,
  Upload,
  Divider,
  Row,
  Typography,
  message,
  Space,
} from 'antd'
import { EHadoopType, ETrueFalse } from '@/utils/enum'
import { transferEnumToOptions } from '@/utils/utils'
import {
  EyeInvisibleOutlined,
  EyeTwoTone,
  MinusCircleOutlined,
  PlusOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import { history, useParams } from 'umi'
import { getHadoopConfig, createHadoop } from '@/pages/RegistrationCenter/ClusterManage/service'
import {
  formLayout,
  IHadoop,
  ITabComProps,
} from '@/pages/RegistrationCenter/ClusterManage/Hadoop/data.d'
import { CODE } from '@/components/Common/crud'
const { Link } = Typography

const Address = ({ value }: any) => {
  const linkList = (value || '').split(',')
  return linkList.map((str, index) => (
    <>
      <Link target={'_blank'} href={str}>
        {str}
      </Link>
      {index === linkList.length - 1 ? null : ','}
    </>
  ))
}

const BasicTab: React.FC<ITabComProps> = (props: ITabComProps) => {
  const pageParams: { id?: string } = useParams()
  const { mode, detailInfo, refreshHadoopInfo } = props

  const [basicForm] = Form.useForm()
  const [configForm] = Form.useForm()
  const [kerberosForm] = Form.useForm()
  const [isLoading, setIsLoading] = useState(false)
  const [collapseKey, setCollapseKey] = useState<any>(['hadoop'])
  const [configLoaded, setConfigLoaded] = useState(false)
  const [cacheConfig, setCacheConfig] = useState<any>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const onLoadConfig = async () => {
    const formRes = await basicForm.validateFields()
    setIsLoading(true)
    const params = {
      type: formRes.type,
      password: formRes.password,
      url: formRes.url,
      username: formRes.username,
    }
    const configRes = await getHadoopConfig(params)

    setIsLoading(false)
    if (configRes) {
      const { hadoop, yarnQueue }: any = configRes
      setCacheConfig(configRes)
      setCollapseKey([...collapseKey, 'config', 'kerberos'])
      setConfigLoaded(true)
      setConfigFormValue(hadoop)
      setKerberosFormValue(hadoop)
      refreshHadoopInfo && refreshHadoopInfo(hadoop, yarnQueue)
    }
  }
  const onSubmit = async () => {
    const basicFormRes = await basicForm.validateFields()
    const kerberosFormRes = await kerberosForm.validateFields()
    const configFormRes = await configForm.validateFields()

    const keytabArr = kerberosFormRes.keytabJson.map((item) => {
      return {
        principle: item.principle,
        keytab: item.keytab[0]?.response?.datas,
      }
    })

    setIsSubmitting(true)
    const result = await createHadoop({
      ...basicFormRes,
      ...configFormRes,
      ...kerberosFormRes,
      keytabJson: JSON.stringify(keytabArr),
      yarnQueueModels: cacheConfig.yarnQueue || [],
    })
    setIsSubmitting(false)
    if (result) {
      message.success('操作成功')
      history.push('/registration/cluster/hadoop')
    }
  }

  const setBasicFormValue = (info: IHadoop) => {
    basicForm.setFieldsValue({
      type: info.type,
      name: info.name,
      url: info.url,
      username: info.username,
      password: info.password,
    })
  }

  const setConfigFormValue = (info: IHadoop) => {
    configForm.setFieldsValue({
      clusterName: info.clusterName,
      clusterStatus: info.clusterStatus,
      version: info.version,
      hdfsHa: info.hdfsHa,
      namenodeAddress: info.namenodeAddress,
      hiveHa: info.hiveHa,
      hiveserverAddress: info.hiveserverAddress,
      metastoreAddress: info.metastoreAddress,
      yarnHa: info.yarnHa,
      resourcemanagerAddress: info.resourcemanagerAddress,
      zkQuorum: info.zkQuorum,
      uuid: info.uuid,
    })
  }
  const setKerberosFormValue = (info: IHadoop) => {
    kerberosForm.setFieldsValue({
      kerberos: info.kerberos,
      kdcHost: info.kdcHost,
      realm: info.realm,
    })
  }

  useEffect(() => {
    if ((mode === 'edit' || mode === 'view') && detailInfo && detailInfo.hadoop) {
      setCollapseKey([...collapseKey, 'config', 'kerberos'])
      setConfigLoaded(true)
      setBasicFormValue(detailInfo.hadoop)
      setConfigFormValue(detailInfo.hadoop)
      setKerberosFormValue(detailInfo.hadoop)
      setCacheConfig(detailInfo)
    }
  }, [])

  const submitVisible = () => {
    if (mode === 'view') return false
    if (mode === 'edit' || mode === 'create') return configLoaded
    return false
  }
  const getUploadProps = () => {
    const uuid = configForm.getFieldValue('uuid')
    return {
      name: 'files',
      action: '/api/hadoop/cluster/upload',
      headers: {
        authorization: 'authorization-text',
      },
      data: {
        uuid,
      },
      maxCount: 1,
      showUploadList: false,
      onChange(info) {
        if (info.file.status === 'done') {
          console.log('kerberosForm', kerberosForm.getFieldsValue())
          if (info.file.response.code == CODE.SUCCESS) {
            message.success(info.file.response.msg)
          } else {
            message.warn(info.file.response.msg)
          }
        } else if (info.file.status === 'error') {
          message.error('上传失败')
        }
      },
    }
  }
  return (
    <>
      <Collapse
        className={styles['collapse-wrap']}
        bordered={false}
        activeKey={collapseKey}
        onChange={(key: string | string[]) => {
          setCollapseKey(key)
        }}
      >
        <Collapse.Panel header="Hadoop 平台" key="hadoop">
          <Form {...formLayout} form={basicForm} name="basic-form" initialValues={{ type: 'CDH' }}>
            <Form.Item label="Hadoop 平台类型" name="type">
              <Radio.Group disabled={configLoaded} options={transferEnumToOptions(EHadoopType)} />
            </Form.Item>
            <Form.Item
              label="名称"
              name="name"
              rules={[{ required: true, message: '请输入名称！' }]}
            >
              <Input readOnly={mode === 'view'} placeholder="请输入名称" style={{ width: 500 }} />
            </Form.Item>
            <Form.Item
              label="地址"
              name="url"
              rules={[{ required: true, message: '请输入地址！' }]}
            >
              <Input
                disabled={configLoaded || mode === 'edit'}
                placeholder="请输入地址"
                style={{ width: 500 }}
              />
            </Form.Item>
            <Form.Item
              label="用户名"
              name="username"
              rules={[{ required: true, message: '请输入用户名！' }]}
            >
              <Input
                disabled={configLoaded || mode === 'edit'}
                placeholder="请输入用户名"
                style={{ width: 500 }}
              />
            </Form.Item>
            <Form.Item
              label="密码"
              name="password"
              rules={[{ required: true, message: '请输入密码！' }]}
            >
              <Input.Password
                disabled={configLoaded || mode === 'edit'}
                placeholder="请输入密码"
                style={{ width: 500 }}
                iconRender={(visible) => null}
              />
            </Form.Item>
            {mode === 'create' ? (
              <Form.Item>
                <Button loading={isLoading} onClick={onLoadConfig}>
                  加载配置
                </Button>
                {configLoaded ? (
                  <Button
                    style={{ marginLeft: 20 }}
                    onClick={() => {
                      setCollapseKey(['hadoop'])
                      setConfigLoaded(false)
                      setConfigFormValue({} as any)
                      setKerberosFormValue({} as any)
                    }}
                  >
                    重置配置
                  </Button>
                ) : null}
              </Form.Item>
            ) : null}
          </Form>
        </Collapse.Panel>
        {configLoaded ? (
          <>
            <Collapse.Panel header="配置信息" key="config">
              <Form {...formLayout} form={configForm} name="config-form" initialValues={{}}>
                <Divider orientation="left" orientationMargin="0">
                  集群信息
                </Divider>
                <Form.Item label="集群名称" name="clusterName">
                  <Input readOnly style={{ width: 500 }} />
                </Form.Item>
                <Form.Item label="集群状态" name="clusterStatus">
                  <Input readOnly style={{ width: 500 }} />
                </Form.Item>
                <Form.Item label="集群版本" name="version">
                  <Input readOnly style={{ width: 500 }} />
                </Form.Item>
                <Form.Item label="uuid" name="uuid">
                  <Input readOnly style={{ width: 500 }} />
                </Form.Item>
                <Divider orientation="left" orientationMargin="0">
                  Hdfs 信息
                </Divider>
                <Form.Item label="Hdfs高可用" name="hdfsHa">
                  <Radio.Group disabled options={transferEnumToOptions(ETrueFalse)} />
                </Form.Item>
                <Form.Item label="Namenode地址" name="namenodeAddress">
                  <Address />
                </Form.Item>
                <Divider orientation="left" orientationMargin="0">
                  Hive 信息
                </Divider>
                <Form.Item label="Hive高可用" name="hiveHa">
                  <Radio.Group disabled options={transferEnumToOptions(ETrueFalse)} />
                </Form.Item>
                <Form.Item label="Hiveserver地址" name="hiveserverAddress">
                  <Address />
                </Form.Item>
                <Form.Item label="Hive Metastore 地址" name="metastoreAddress">
                  <Address />
                </Form.Item>
                <Divider orientation="left" orientationMargin="0">
                  Yarn 信息
                </Divider>
                <Form.Item label="Yarn高可用" name="yarnHa">
                  <Radio.Group disabled options={transferEnumToOptions(ETrueFalse)} />
                </Form.Item>
                <Form.Item label="Resourcemanager地址" name="resourcemanagerAddress">
                  <Address />
                </Form.Item>
                <Divider orientation="left" orientationMargin="0">
                  Zookeeper 信息
                </Divider>
                <Form.Item label="Zookeeper地址" name="zkQuorum">
                  <Input readOnly style={{ width: 500 }} />
                </Form.Item>
              </Form>
            </Collapse.Panel>
            <Collapse.Panel header="Kerberos认证" key="kerberos">
              <Form {...formLayout} form={kerberosForm} name="kerberos-form" initialValues={{}}>
                <Form.Item label="是否启用Kerberos" name="kerberos">
                  <Radio.Group disabled options={transferEnumToOptions(ETrueFalse)} />
                </Form.Item>
                <Form.Item
                  noStyle
                  shouldUpdate={(prevValues, currentValues) =>
                    prevValues.kerberos !== currentValues.kerberos
                  }
                >
                  {({ getFieldValue }) =>
                    getFieldValue('kerberos') ? (
                      <>
                        <Form.Item label="KdcHost" name="kdcHost">
                          <Input readOnly style={{ width: 500 }} />
                        </Form.Item>
                        <Form.Item label="Realm" name="realm">
                          <Input readOnly style={{ width: 500 }} />
                        </Form.Item>

                        <Form.List name="keytabJson">
                          {(fields, { add, remove }) => (
                            <>
                              <Form.Item label="Principal/Keytab" style={{ marginBottom: 0 }}>
                                {fields.map(({ key, name, ...restField }, fieldIndex) => (
                                  <>
                                    <Space
                                      key={key}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        marginBottom: 8,
                                      }}
                                      align="baseline"
                                    >
                                      <Form.Item
                                        {...restField}
                                        name={[name, 'principle']}
                                        rules={[{ required: true, message: '请输入Principal' }]}
                                      >
                                        <Input
                                          disabled={mode === 'view'}
                                          style={{ width: 300 }}
                                          placeholder="Principal"
                                        />
                                      </Form.Item>
                                      <Form.Item
                                        {...restField}
                                        name={[name, 'keytab']}
                                        rules={[{ required: true, message: '请上传Keytab文件' }]}
                                        valuePropName="fileList"
                                        getValueFromEvent={(e: any) => {
                                          console.log('e', e)
                                          if (Array.isArray(e)) {
                                            return e
                                          }
                                          return e?.fileList
                                        }}
                                      >
                                        <Upload disabled={mode === 'view'} {...getUploadProps()}>
                                          <Input.Group compact>
                                            <Button
                                              disabled={mode === 'view'}
                                              style={{ width: 80 }}
                                              icon={<UploadOutlined />}
                                            >
                                              上传
                                            </Button>

                                            <Form.Item
                                              noStyle
                                              shouldUpdate={(prevValues, currentValues) =>
                                                prevValues.keytabJson[fieldIndex] !==
                                                currentValues.keytabJson[fieldIndex]
                                              }
                                            >
                                              {({ getFieldValue }) => (
                                                <Input
                                                  style={{ width: 300 }}
                                                  placeholder="keytab"
                                                  readOnly
                                                  value={
                                                    getFieldValue('keytabJson')[fieldIndex]?.[
                                                      'keytab'
                                                    ]?.[0]?.response?.datas || ''
                                                  }
                                                />
                                              )}
                                            </Form.Item>
                                          </Input.Group>
                                        </Upload>
                                      </Form.Item>

                                      {mode !== 'view' ? (
                                        <MinusCircleOutlined
                                          style={{ marginTop: 8 }}
                                          onClick={() => remove(name)}
                                        />
                                      ) : null}
                                    </Space>
                                  </>
                                ))}
                                {mode !== 'view' ? (
                                  <Button
                                    type="dashed"
                                    style={{ width: 300 }}
                                    onClick={() => add()}
                                    block
                                    icon={<PlusOutlined />}
                                  >
                                    添加 Principal/Keytab
                                  </Button>
                                ) : null}
                              </Form.Item>
                            </>
                          )}
                        </Form.List>
                      </>
                    ) : null
                  }
                </Form.Item>
              </Form>
            </Collapse.Panel>
          </>
        ) : null}
      </Collapse>

      {submitVisible() ? (
        <Row>
          <Button
            loading={isSubmitting}
            style={{ marginLeft: 30 }}
            type={'primary'}
            onClick={onSubmit}
          >
            提交
          </Button>
        </Row>
      ) : null}
    </>
  )
}

export default BasicTab
