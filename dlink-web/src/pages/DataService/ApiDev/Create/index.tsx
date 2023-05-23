import React, { useCallback, useEffect, useState, useRef, useMemo } from 'react'
import styles from './index.less'

import { Card, Button, Steps, Form, message } from 'antd'
import { PageContainer } from '@ant-design/pro-layout'
import { history } from 'umi'

import { Scrollbars } from 'react-custom-scrollbars'
import BasicSetting from './components/BasicSetting'
import AccessLogic from './components/AccessLogic'
import ApiTest from './components/ApiTest'

import { requestCreateApi } from '@/pages/DataService/ApiDev/Create/service'

import { CODE } from '@/components/Common/crud'
import { getStepBasic, formLayout } from '@/pages/DataService/ApiDev/Create/utils'

const mode = 'create'

const CreateApi: React.FC<{}> = (props: any) => {
  const sref: any = React.createRef<Scrollbars>()
  const [pageStep, setPageStep] = useState(0)
  const [form] = Form.useForm()
  const forms = useMemo(() => ({}), [])
  const StepComponents = [BasicSetting, AccessLogic, ApiTest]

  const getCurrentPage = (currentStep) => {
    const Com = StepComponents[currentStep]
    const stepBasic = getStepBasic(currentStep, forms)

    return (
      <Com mode={mode} form={form} formLayout={formLayout} forms={forms} stepBasic={stepBasic} />
    )
  }
  const onNext = (e) => {
    e.preventDefault()
    form
      .validateFields()
      .then((value) => {
        forms[pageStep] = value
        setPageStep(pageStep + 1)
      })
      .catch(() => {})
  }
  const onSubmit = (e) => {
    e.preventDefault()
    const { catalogue, ...basicForm } = forms[0]
    const params = {
      catalogueId: catalogue.id,
      ...basicForm,
      ...forms[1],
    }
    requestCreateApi(params).then((res) => {
      if (res.code === CODE.SUCCESS) {
        message.success('创建成功')
        history.push('/dataService/devApi/catalogue')
      } else {
        message.error(res.msg)
      }
    })
  }
  return (
    <PageContainer
      className={styles['create-page']}
      title={false}
      footer={[
        pageStep > 0 ? (
          <Button
            key="pre"
            onClick={() => {
              setPageStep(pageStep - 1)
            }}
          >
            上一步
          </Button>
        ) : null,
        pageStep < 2 ? (
          <Button key="next" onClick={onNext}>
            下一步
          </Button>
        ) : null,
        pageStep === 2 ? (
          <Button key="submit" type="primary" onClick={onSubmit}>
            提交
          </Button>
        ) : null,
        <Button
          key="back"
          onClick={() => {
            history.goBack()
          }}
        >
          取消
        </Button>,
      ]}
    >
      <Steps
        style={{ width: 400 }}
        size="small"
        current={pageStep}
        items={[
          {
            title: '基础配置',
          },
          {
            title: '取数逻辑',
          },
          {
            title: '测试',
          },
        ]}
      />
      <Card title={false} bordered={false} className={styles['page-card']}>
        <Scrollbars style={{ height: `calc(100vh - 48px - 50px - 72px - 24px - 80px)` }} ref={sref}>
          <div style={{ width: '100%', padding: 10, paddingBottom: 0 }}>
            {getCurrentPage(pageStep)}
          </div>
        </Scrollbars>
      </Card>
    </PageContainer>
  )
}

export default CreateApi
