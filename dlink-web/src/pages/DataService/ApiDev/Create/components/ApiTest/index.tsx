import React, { useCallback, useEffect, useState } from 'react'
import styles from './index.less'
import { Descriptions, Form, Button, message, Row, Input } from 'antd'
import type { ProColumns } from '@ant-design/pro-components'
import { EditableProTable } from '@ant-design/pro-components'

import { CODE } from '@/components/Common/crud'
import { EDataType } from '@/pages/DataService/ApiDev/Create/components/Parameters'
import { IStepComProps } from '@/pages/DataService/ApiDev/Create/type'

import { requestApiTest } from '@/pages/DataService/ApiDev/Create/service'
interface ITestParams {
  name: string
  value?: string
  type: EDataType
  id?: number
}

interface IExecuteResult {
  request?: string
  requestPath?: string
  response?: string
  timeConsuming?: number
}

export default ({ form, formLayout, forms, mode, stepBasic = {} }: IStepComProps) => {
  const [testParams, setTestParams] = useState<readonly ITestParams[]>([])
  const [tableForm] = Form.useForm()
  const [executeResult, setExecuteResult] = useState<IExecuteResult>({})

  const executeQuery = (reqP) => {
    const { path, datasourceId, segment } = stepBasic
    const tempParam = {
      datasourceId: datasourceId,
      sql: segment,
      params: JSON.stringify(reqP),
    }

    requestApiTest(path, tempParam)
      .then((res) => {
        if (res.code === CODE.SUCCESS) {
          setExecuteResult(res.datas)
        } else {
          setExecuteResult(res.datas)
        }
      })
      .catch((err) => {
        setExecuteResult({
          response: err,
        })
      })
  }

  useEffect(() => {
    setTestParams(
      JSON.parse(stepBasic?.params || '[]').map((item, index) => ({
        id: index,
        name: item.name,
        type: item.type,
        value: '',
      })),
    )
  }, [stepBasic?.params])
  const columns: ProColumns<ITestParams>[] = [
    {
      title: '参数名',
      dataIndex: 'name',
      editable: false,
    },
    {
      title: '参数类型',
      dataIndex: 'type',
      editable: false,
      render: (cellValue, record) => {
        return EDataType[cellValue as any]
      },
    },
    {
      title: '值',
      dataIndex: 'value',
      formItemProps: {
        rules: [],
      },
    },
  ]

  return (
    <div className={styles['api-test']}>
      <div className="left-part">
        <Descriptions column={1} title={false} layout="horizontal">
          <Descriptions.Item label="API 名称">{stepBasic?.name}</Descriptions.Item>
          <Descriptions.Item label="请求Path">{stepBasic?.path}</Descriptions.Item>
        </Descriptions>
        <div>参数配置</div>
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
                  executeQuery(reqP)
                })
                .catch(() => {})
              return
            }
            executeQuery({})
          }}
        >
          接口测试
        </Button>
      </div>
      <div className="right-part">
        <Descriptions column={1} title={false} layout="horizontal">
          <Descriptions.Item label="耗时">
            {executeResult.timeConsuming && `${executeResult.timeConsuming}ms`}
          </Descriptions.Item>
          <Descriptions.Item label="请求">{executeResult.requestPath}</Descriptions.Item>
          <Row>
            <Input.TextArea
              style={{ resize: 'none' }}
              rows={6}
              readOnly
              value={executeResult.request}
            ></Input.TextArea>
          </Row>
          <Descriptions.Item label="响应">{''}</Descriptions.Item>
          <Row>
            <Input.TextArea
              style={{ resize: 'none' }}
              rows={6}
              readOnly
              value={executeResult.response}
            ></Input.TextArea>
          </Row>
        </Descriptions>
      </div>
    </div>
  )
}
