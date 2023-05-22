import React, { useCallback, useEffect, useState, useRef, useMemo } from 'react'
import styles from './index.less'

import { Card, Button, Steps, Form, message } from 'antd'
import { PageContainer } from '@ant-design/pro-layout'
import { history, useParams } from 'umi'

import { Scrollbars } from 'react-custom-scrollbars'
import BasicSetting from '@/pages/DataService/ApiDev/Create/components/BasicSetting'
import AccessLogic from '@/pages/DataService/ApiDev/Create/components/AccessLogic'
import ApiTest from '@/pages/DataService/ApiDev/Create/components/ApiTest'

import { requestCreateApi } from '@/pages/DataService/ApiDev/Create/service'
import { requestApiDetail } from '@/pages/DataService/ApiDev/Edit/service'

import { CODE } from '@/components/Common/crud'

const formLayout = {
  labelCol: { flex: '150px' },
  labelAlign: 'left',
  labelWrap: true,
  wrapperCol: { flex: 1 },
  colon: false,
}
const EditApi: React.FC<{}> = (props: any) => {
  const sref: any = React.createRef<Scrollbars>()
  const [pageStep, setPageStep] = useState(0)
  const [detailInfo, setDetailInfo] = useState<any>({})
  const [form] = Form.useForm()
  const forms = useMemo(() => ({}), [])
  const StepComponents = [BasicSetting, AccessLogic, ApiTest]
  const pageParams: any = useParams()

  const getCurrentPage = (currentStep) => {
    const Com = StepComponents[currentStep]

    return (
      <Com
        mode={'edit'}
        detailInfo={detailInfo}
        form={form}
        formLayout={formLayout}
        forms={forms}
      />
    )
  }

  const onNext = (e) => {
    e.preventDefault()
    form
      .validateFields()
      .then((value) => {
        forms[pageStep] = value
        if (pageStep === 0) {
          const { accessType, datasourceType, datasourceId, datasourceDb, segment } = detailInfo

          form.setFieldsValue({
            accessType,
            datasourceType,
            datasourceId,
            datasourceDb,
            segment,
          })
        }
        setPageStep(pageStep + 1)
      })
      .catch(() => {})
  }
  const onSubmit = (e) => {
    e.preventDefault()
    console.log('forms', forms)
    const { catalogue, ...basicForm } = forms[0]
    const params = {
      id: detailInfo.id,
      catalogueId: catalogue.id,
      ...basicForm,
      ...forms[1],
    }
    requestCreateApi(params).then((res) => {
      if (res.code === CODE.SUCCESS) {
        message.success('编辑成功')
        history.goBack()
      } else {
        message.error(res.msg)
      }
    })
  }

  useEffect(() => {
    requestApiDetail(pageParams.id).then((res) => {
      if (res.code === CODE.SUCCESS) {
        console.log(res.datas)
        setDetailInfo(res.datas)
        const {
          authType,
          absolutePath,
          catalogueId,
          path,
          name,
          contentType,
          params,
          description,
        } = res.datas
        form.setFieldsValue({
          catalogue: {
            id: catalogueId,
            path: absolutePath,
          },
          path,
          name,
          contentType,
          params,
          description,
          authType,
        })
      }
    })
  }, [])

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

export default EditApi
