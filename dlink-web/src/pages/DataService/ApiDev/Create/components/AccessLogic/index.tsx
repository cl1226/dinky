import React, { useState, useRef } from 'react'
import styles from './index.less'
import { DoubleRightOutlined } from '@ant-design/icons'
import {
  Space,
  Button,
  Table,
  Form,
  Select,
  Row,
  Col,
  Modal,
  ConfigProvider,
  Tabs,
  message,
  Tooltip,
  Empty,
  Alert,
} from 'antd'
import AceEditor from 'react-ace'
import 'ace-builds/src-noconflict/mode-mysql'
import 'ace-builds/src-noconflict/theme-github'
import SelectHelp from '@/components/SelectHelp'
import { EAsyncCode } from '@/components/SelectHelp/type.d'
import type { ProColumns } from '@ant-design/pro-components'
import { EditableProTable } from '@ant-design/pro-components'

import { transferEnumToOptions } from '@/utils/utils'
import { EAccessType } from '@/utils/enum'
import { EDataType } from '@/pages/DataService/ApiDev/Create/components/Parameters'
import { IStepComProps } from '@/pages/DataService/ApiDev/Create/type'
import { CODE } from '@/components/Common/crud'

import { requestExecuteSql } from '@/pages/DataService/ApiDev/Create/service'
interface ITestParams {
  name: string
  value: string
  id?: number
}

const accessTypeOptions = transferEnumToOptions(EAccessType)

export const ParamtersTable = ({ params, onAdd }) => {
  const getDataSource = () => {
    return (params || []).map((item, index) => ({
      ...item,
      variable: '${' + item.name + '}',
      tempId: index,
    }))
  }
  const columns = [
    {
      title: '变量',
      dataIndex: 'variable',
      key: 'variable',
      width: 80,
    },
    {
      title: '参数名',
      dataIndex: 'name',
      key: 'name',
      width: 80,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (cellValue, record) => {
        return EDataType[cellValue]
      },
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 120,
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 50,
      render: (cellValue, record) => (
        <Button
          size="small"
          type="text"
          icon={
            <DoubleRightOutlined
              onClick={() => {
                onAdd(record)
              }}
            />
          }
        ></Button>
      ),
    },
  ]

  return (
    <Table
      style={{ width: '100%' }}
      rowKey="tempId"
      size="small"
      dataSource={getDataSource()}
      columns={columns}
      pagination={false}
    />
  )
}

export const CustomTable = ({ dataSource }) => {
  const getColumns = (rowItem) =>
    Object.keys(rowItem || []).map((key) => ({
      title: key,
      dataIndex: key,
      ellipsis: {
        showTitle: false,
      },
      width: 100,
      render: (cellValue) => (
        <Tooltip placement="topLeft" title={cellValue}>
          {cellValue}
        </Tooltip>
      ),
    }))
  return dataSource && dataSource.length ? (
    <Table
      columns={getColumns(dataSource?.[0])}
      dataSource={dataSource}
      rowKey="id"
      size="small"
      bordered
      scroll={{ y: 400 }}
      pagination={false}
    />
  ) : (
    <Empty />
  )
}

export default (props: IStepComProps) => {
  const { formLayout, forms, mode } = props
  const form: any = props.form

  const [visible, setVisible] = useState(false)
  const editorRef = useRef<any>(null)
  const [testParams, setTestParams] = useState<readonly ITestParams[]>([])
  const [executeKey, setExecuteKey] = useState('1')
  const [executeResult, setExecuteResult] = useState([])
  const [executeSqlStr, setExecuteSqlStr] = useState('')

  const [tableForm] = Form.useForm()

  const onAddVariable = (rowItem) => {
    const editor = editorRef?.current?.editor
    const cursorPos = editor.getCursorPosition()
    editor.session.insert(
      cursorPos,
      rowItem.type == 'string' ? "'" + rowItem.variable + "'" : rowItem.variable,
    )
  }
  const executeSql = (reqP) => {
    const tempParam = {
      datasourceId: form.getFieldValue('datasourceId'),
      sql: form.getFieldValue('segment'),
      params: JSON.stringify(reqP),
    }
    setExecuteSqlStr('')
    setExecuteResult([])
    requestExecuteSql(tempParam).then((res) => {
      if (res.code === CODE.SUCCESS) {
        setExecuteKey('2')
        const { result, executeSQL } = res.datas || {}
        setExecuteResult(result)
        setExecuteSqlStr(executeSQL)
      } else {
        message.error(res.msg)
      }
    })
  }
  const columns: ProColumns<ITestParams>[] = [
    {
      title: '入参名',
      dataIndex: 'name',
      editable: false,
    },
    {
      title: '值',
      dataIndex: 'value',
      formItemProps: {},
    },
  ]
  return (
    <>
      <Form
        {...formLayout}
        form={form}
        name="access-logic-form"
        initialValues={{
          accessType: (accessTypeOptions as any)[0].value,
        }}
      >
        <Row>
          <Col span={10} style={{ paddingRight: 10 }}>
            <Form.Item
              label="取数方式"
              name="accessType"
              rules={[{ required: true, message: '请选择取数方式' }]}
            >
              <Select
                placeholder="请选择"
                style={{ width: 300 }}
                options={accessTypeOptions}
              ></Select>
            </Form.Item>
            <Form.Item
              label="数据源类型"
              name="datasourceType"
              rules={[{ required: true, message: '请选择数据源类型' }]}
            >
              <SelectHelp
                placeholder="请选择"
                style={{ width: 300 }}
                asyncCode={EAsyncCode.datasourceType}
                onChange={() => {
                  form.setFieldsValue({
                    datasourceId: '',
                    datasourceDb: '',
                  })
                }}
              ></SelectHelp>
            </Form.Item>

            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.datasourceType !== currentValues.datasourceType
              }
            >
              {({ getFieldValue }) =>
                getFieldValue('datasourceType') || mode === 'edit' ? (
                  <Form.Item
                    label="数据连接"
                    name="datasourceId"
                    rules={[{ required: true, message: '请选择数据连接' }]}
                  >
                    <SelectHelp
                      placeholder="请选择"
                      style={{ width: 300 }}
                      asyncCode={EAsyncCode.datasourceId}
                      asyncParams={{ value: getFieldValue('datasourceType') }}
                      optionFormatter={(options) =>
                        options.map((option) => ({ label: option.name, value: option.id }))
                      }
                      onChange={() => {
                        form.setFieldsValue({
                          datasourceDb: '',
                        })
                      }}
                    ></SelectHelp>
                  </Form.Item>
                ) : null
              }
            </Form.Item>

            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.datasourceId !== currentValues.datasourceId
              }
            >
              {({ getFieldValue }) =>
                getFieldValue('datasourceId') || mode === 'edit' ? (
                  <Form.Item
                    label="数据库"
                    name="datasourceDb"
                    rules={[{ required: true, message: '请选择数据库' }]}
                  >
                    <SelectHelp
                      placeholder="请选择"
                      style={{ width: 300 }}
                      asyncCode={EAsyncCode.datasourceDb}
                      asyncParams={{ value: getFieldValue('datasourceId') }}
                      optionFormatter={(options) =>
                        options.map((option) => ({ label: option.name, value: option.name }))
                      }
                    ></SelectHelp>
                  </Form.Item>
                ) : null
              }
            </Form.Item>
          </Col>
          <Col span={14}>
            <Alert
              type="warning"
              message={
                <>
                  <div>{`支持动态SQL语法：`}</div>
                  <div>{'支持参数 #{ }、${ } 两种写法'}</div>
                  <div>{`<if test=""></if>`}</div>
                  <div>{`<where></where>`}</div>
                  <div>{`<foreach open="(" close=")" collection="" separator="," item="item" index="index">#{item}</foreach>`}</div>
                  <div>{`<trim prefix="" suffix="" suffixesToOverride="" prefixesToOverride=""></trim>`}</div>
                  <div>{`更多请参考MyBatis动态SQL官网`}</div>
                </>
              }
            ></Alert>
          </Col>
          <br />
        </Row>

        <Row>
          <Col span={10} style={{ paddingRight: 10 }}>
            <Form.Item label="入参" labelCol={{ span: 24 }}>
              <ParamtersTable
                params={JSON.parse(forms?.[0]?.params || '[]')}
                onAdd={onAddVariable}
              />
            </Form.Item>
          </Col>
          <Col span={14}>
            <Form.Item
              label={
                <Space>
                  脚本编辑{' '}
                  <Button
                    onClick={() => {
                      if (!form.getFieldValue('segment')) {
                        message.error('请输入sql')
                        return
                      }
                      setVisible(true)
                      setTestParams(
                        JSON.parse(forms?.[0]?.params || '[]').map((item, index) => ({
                          id: index,
                          name: item.name,
                          value: '',
                        })),
                      )
                    }}
                  >
                    SQL测试
                  </Button>
                </Space>
              }
              name="segment"
              labelCol={{ span: 24 }}
              rules={[{ required: true }]}
              className={styles['segment_item']}
            >
              <AceEditor
                ref={editorRef}
                width="100%"
                mode="mysql"
                theme="github"
                showPrintMargin={false}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>

      <Modal
        width={1000}
        bodyStyle={{ padding: '32px 40px 48px' }}
        destroyOnClose
        title={`SQL测试`}
        open={visible}
        footer={false}
        onCancel={() => setVisible(false)}
      >
        <div className={styles['test-sql']}>
          <div className="testsql-left">
            <div className="testsql-params">
              <ConfigProvider renderEmpty={() => null}>
                <EditableProTable<ITestParams>
                  columns={columns}
                  recordCreatorProps={false}
                  rowKey="id"
                  size="small"
                  value={testParams}
                  scroll={{ y: 400 }}
                  editable={{
                    form: tableForm,
                    type: 'multiple',
                    editableKeys: testParams.map((item) => item.id) as any,
                    onValuesChange: (record, recordList) => {
                      setTestParams(recordList)
                    },
                  }}
                />
              </ConfigProvider>
            </div>
            <div className="testsql-btn">
              <Button
                onClick={() => {
                  if (testParams && testParams.length) {
                    tableForm
                      .validateFields()
                      .then((value) => {
                        const reqP = {}
                        Object.keys(value).forEach((key) => {
                          reqP[testParams[key].name] = value[key].value
                        })
                        executeSql(reqP)
                      })
                      .catch(() => {})
                    return
                  }
                  executeSql({})
                }}
              >
                执行
              </Button>
              执行仅显示前10条结果
            </div>
          </div>
          <div className="testsql-right">
            <Tabs
              activeKey={executeKey}
              onChange={(key) => {
                setExecuteKey(key)
              }}
            >
              <Tabs.TabPane tab="初始SQL" key="1">
                <AceEditor
                  width="100%"
                  height="400px"
                  mode="mysql"
                  theme="github"
                  readOnly
                  showPrintMargin={false}
                  value={form.getFieldValue('segment')}
                />
              </Tabs.TabPane>
              <Tabs.TabPane tab="执行结果" key="2">
                <CustomTable dataSource={executeResult}></CustomTable>
              </Tabs.TabPane>
              <Tabs.TabPane tab="执行SQL" key="3">
                {executeSqlStr ? (
                  <AceEditor
                    width="100%"
                    height="400px"
                    mode="mysql"
                    theme="github"
                    readOnly
                    showPrintMargin={false}
                    value={executeSqlStr}
                  />
                ) : (
                  <Empty />
                )}
              </Tabs.TabPane>
            </Tabs>
          </div>
        </div>
      </Modal>
    </>
  )
}
