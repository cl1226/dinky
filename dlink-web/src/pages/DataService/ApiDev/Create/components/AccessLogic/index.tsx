import React, { useCallback, useEffect, useState, useRef } from 'react'
import styles from './index.less'
import { PlusOutlined } from '@ant-design/icons'
import {
  Space,
  Button,
  Table,
  Form,
  Input,
  Select,
  Row,
  Col,
  Modal,
  ConfigProvider,
  Tabs,
  message,
} from 'antd'
import { transferEnumToOptions } from '@/utils/utils'
import { EDataType } from '@/pages/DataService/ApiDev/Create/components/Parameters'
import SelectHelp, { EAsyncCode } from '@/components/SelectHelp'
import { EAccessType } from '@/utils/enum'
import AceEditor from 'react-ace'
import 'ace-builds/src-noconflict/mode-mysql'
import 'ace-builds/src-noconflict/theme-github'
import type { ProColumns } from '@ant-design/pro-components'
import { EditableProTable } from '@ant-design/pro-components'
import { requestExecuteSql } from '@/pages/DataService/ApiDev/Create/service'
import { CODE } from '@/components/Common/crud'
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
            <PlusOutlined
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

const CustomTable=(dataSource)=>{

    dataSource = [{"tenant_id":1,"cron":"{\"timezoneId\":\"Asia/Shanghai\",\"crontab\":\"0 0 * * * ? *\",\"startTime\":\"2023-05-12 16:58:14\",\"endTime\":\"2123-05-12 16:58:14\"}","create_time":"2023-05-12T16:57:00","graph_data":"{\"nodes\":[{\"id\":\"8fbe131e-fba8-47cd-9d35-860d16cff019\",\"renderKey\":\"DND_NDOE\",\"width\":180,\"height\":36,\"label\":\"mysql_create_table\",\"parentId\":\"1\",\"jobId\":9,\"popoverContent\":{\"key\":null,\"ref\":null,\"props\":{},\"_owner\":null},\"x\":-230,\"y\":-150,\"ports\":[{\"type\":\"input\",\"group\":\"top\",\"tooltip\":\"输入桩1\",\"id\":\"42dc72b2-943a-4782-9045-fd2168ced833\"},{\"type\":\"output\",\"group\":\"bottom\",\"tooltip\":\"输出桩\",\"id\":\"225c88a0-7093-4e9b-943f-2226cad9eac9\"}]},{\"id\":\"c8e97cd8-a5fc-4eec-af32-f339a0f319b6\",\"renderKey\":\"DND_NDOE\",\"width\":180,\"height\":36,\"label\":\"mysql_hive\",\"parentId\":\"1\",\"jobId\":10,\"popoverContent\":{\"key\":null,\"ref\":null,\"props\":{},\"_owner\":null},\"x\":-60,\"y\":-30,\"ports\":[{\"type\":\"input\",\"group\":\"top\",\"tooltip\":\"输入桩1\",\"id\":\"254b9482-d03d-413a-865d-e31592c17142\"},{\"type\":\"output\",\"group\":\"bottom\",\"tooltip\":\"输出桩\",\"id\":\"d73ad268-94c8-4648-aabf-b1042631f5e6\"}]},{\"id\":\"82950284-ecdc-4fa4-a410-dbdeee308f55\",\"renderKey\":\"DND_NDOE\",\"width\":180,\"height\":36,\"label\":\"hive_starrocks\",\"parentId\":\"1\",\"jobId\":14,\"popoverContent\":{\"key\":null,\"ref\":null,\"props\":{},\"_owner\":null},\"x\":80,\"y\":110,\"ports\":[{\"type\":\"input\",\"group\":\"top\",\"tooltip\":\"输入桩1\",\"id\":\"bef05100-390e-4b38-93a4-ca0fafd1b156\"},{\"type\":\"output\",\"group\":\"bottom\",\"tooltip\":\"输出桩\",\"id\":\"b4ad1c72-23f2-42ce-a610-cb18b302c656\"}]}],\"edges\":[{\"id\":\"01c54af6-999c-4733-98ea-22ac161e162b\",\"targetPortId\":\"254b9482-d03d-413a-865d-e31592c17142\",\"sourcePortId\":\"225c88a0-7093-4e9b-943f-2226cad9eac9\",\"source\":\"8fbe131e-fba8-47cd-9d35-860d16cff019\",\"target\":\"c8e97cd8-a5fc-4eec-af32-f339a0f319b6\",\"edge\":{\"shape\":\"xflow-edge\",\"attrs\":{\"line\":{\"stroke\":\"#d5d5d5\",\"strokeWidth\":1,\"targetMarker\":\"\",\"strokeDasharray\":\"\"}},\"zIndex\":1,\"highlight\":false,\"id\":\"df529c22-8534-4742-ba72-9f885a73f7a3\",\"source\":{\"cell\":\"8fbe131e-fba8-47cd-9d35-860d16cff019\",\"port\":\"225c88a0-7093-4e9b-943f-2226cad9eac9\"},\"target\":{\"cell\":\"c8e97cd8-a5fc-4eec-af32-f339a0f319b6\",\"port\":\"254b9482-d03d-413a-865d-e31592c17142\"}},\"connector\":{\"name\":\"rounded\"},\"router\":{\"name\":\"manhattan\"},\"sourcePort\":\"225c88a0-7093-4e9b-943f-2226cad9eac9\",\"targetPort\":\"254b9482-d03d-413a-865d-e31592c17142\"},{\"id\":\"f4bcd69d-f235-455b-9264-abcee2707733\",\"targetPortId\":\"bef05100-390e-4b38-93a4-ca0fafd1b156\",\"sourcePortId\":\"d73ad268-94c8-4648-aabf-b1042631f5e6\",\"source\":\"c8e97cd8-a5fc-4eec-af32-f339a0f319b6\",\"target\":\"82950284-ecdc-4fa4-a410-dbdeee308f55\",\"edge\":{\"shape\":\"xflow-edge\",\"attrs\":{\"line\":{\"stroke\":\"#d5d5d5\",\"strokeWidth\":1,\"targetMarker\":\"\",\"strokeDasharray\":\"\"}},\"zIndex\":1,\"highlight\":false,\"id\":\"2d8ac096-cd4d-4fe7-9c4d-15c35c248dec\",\"source\":{\"cell\":\"c8e97cd8-a5fc-4eec-af32-f339a0f319b6\",\"port\":\"d73ad268-94c8-4648-aabf-b1042631f5e6\"},\"target\":{\"cell\":\"82950284-ecdc-4fa4-a410-dbdeee308f55\",\"port\":\"bef05100-390e-4b38-93a4-ca0fafd1b156\"}},\"connector\":{\"name\":\"rounded\"},\"router\":{\"name\":\"manhattan\"},\"sourcePort\":\"d73ad268-94c8-4648-aabf-b1042631f5e6\",\"targetPort\":\"bef05100-390e-4b38-93a4-ca0fafd1b156\"}]}","scheduler_type":"CYCLE","version_id":null,"type":null,"cron_id":null,"lock_user":"1","enabled":true,"update_time":"2023-05-12T16:58:28","name":"Job_01","alias":"Job_01","id":195,"status":"DEPLOY"}]



    return null
}

export default ({ form, formLayout, forms }) => {
  const [visible, setVisible] = useState(false)
  const editorRef = useRef<any>(null)
  const [testParams, setTestParams] = useState<readonly ITestParams[]>([])
  const [executeKey, setExecuteKey] = useState('1')
  const [executeResult, setExecuteResult] = useState('')

  const [tableForm] = Form.useForm()

  const onAddVariable = (rowItem) => {
    const editor = editorRef?.current?.editor
    const cursorPos = editor.getCursorPosition()
    editor.session.insert(cursorPos, rowItem.variable)
  }
  const executeSql = (reqP) => {
    const tempParam = {
      datasourceId: form.getFieldValue('datasourceId'),
      sql: form.getFieldValue('segment'),
      params: JSON.stringify(reqP),
    }
    requestExecuteSql({
      datasourceId: 6,
      sql: 'select * from dlink.dlink_workflow_task where id=#{id}',
      params: '{ id: 195 }',
    }).then((res) => {
      if (res.code === CODE.SUCCESS) {
        setExecuteKey('2')
        setExecuteResult(JSON.stringify(res.datas))
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
      formItemProps: {
        rules: [
          {
            required: true,
            message: '此项为必填项',
          },
        ],
      },
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
        <Form.Item
          label="取数方式"
          name="accessType"
          rules={[{ required: true, message: '请选择取数方式' }]}
        >
          <Select style={{ width: 300 }} options={accessTypeOptions}></Select>
        </Form.Item>
        <Form.Item
          label="数据源类型"
          name="datasourceType"
          rules={[{ required: true, message: '请选择数据源类型' }]}
        >
          <SelectHelp
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
            getFieldValue('datasourceType') ? (
              <Form.Item
                label="数据连接"
                name="datasourceId"
                rules={[{ required: true, message: '请选择数据连接' }]}
              >
                <SelectHelp
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
            getFieldValue('datasourceId') ? (
              <Form.Item
                label="数据库"
                name="datasourceDb"
                rules={[{ required: true, message: '请选择数据库' }]}
              >
                <SelectHelp
                  style={{ width: 300 }}
                  asyncCode={EAsyncCode.datasourceDb}
                  asyncParams={{ value: getFieldValue('datasourceId') }}
                  optionFormatter={(options) =>
                    options.map((option) => ({ label: option.name, value: option.id }))
                  }
                ></SelectHelp>
              </Form.Item>
            ) : null
          }
        </Form.Item>

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
              <Tabs.TabPane tab="预览SQL" key="1">
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
                {executeResult}
              </Tabs.TabPane>
            </Tabs>
          </div>
        </div>
      </Modal>
    </>
  )
}
