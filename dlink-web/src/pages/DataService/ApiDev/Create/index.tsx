import React, { useCallback, useEffect, useState } from 'react'
import styles from './index.less'
import { Card, Button, Steps } from 'antd'
import { PageContainer } from '@ant-design/pro-layout'
import { history } from 'umi'
import { Scrollbars } from 'react-custom-scrollbars'
import BasicSetting from './components/BasicSetting'
const ApiCatalogue: React.FC<{}> = (props: any) => {
  const sref: any = React.createRef<Scrollbars>()
  const [pageStep, setPageStep] = useState(0)

  const getCurrentPage = () => {
    if (pageStep === 0) {
      return <BasicSetting />
    }
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
          <Button
            key="next"
            onClick={() => {
              setPageStep(pageStep + 1)
            }}
          >
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
          <div style={{ width: '100%', padding: 10, paddingBottom: 0 }}>{getCurrentPage()}</div>
        </Scrollbars>
      </Card>
    </PageContainer>
  )
}

export default ApiCatalogue
