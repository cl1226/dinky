import React, { useCallback, useEffect, useState, useRef, useMemo } from 'react'
import styles from './index.less'
import { Card, Button, Steps, Form } from 'antd'
import { PageContainer } from '@ant-design/pro-layout'
import { history } from 'umi'
import { Scrollbars } from 'react-custom-scrollbars'
import BasicSetting from './components/BasicSetting'
import AccessLogic from './components/AccessLogic'
const formLayout = {
  labelCol: { flex: '150px' },
  labelAlign: 'left',
  labelWrap: true,
  wrapperCol: { flex: 1 },
  colon: false,
}
const ApiCatalogue: React.FC<{}> = (props: any) => {
  const sref: any = React.createRef<Scrollbars>()
  const [pageStep, setPageStep] = useState(1)
  const [form] = Form.useForm()
  const forms = useMemo(() => ({}), [])
  const StepComponents = [BasicSetting, AccessLogic]

  const getCurrentPage = (currentStep) => {
    const Com = StepComponents[currentStep]

    return <Com form={form} formLayout={formLayout} forms={forms} />
  }
  const onNext = (e) => {
    e.preventDefault()
    form
      .validateFields()
      .then((value) => {
        console.log(value, 'value')
        forms[pageStep] = value
        setPageStep(pageStep + 1)
      })
      .catch(() => {})
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
          <Button key="submit" type="primary">
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

export default ApiCatalogue
