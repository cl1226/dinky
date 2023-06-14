import { useEffect, useRef, useState } from 'react'
import { PageContainer } from '@ant-design/pro-components'
import { Button, Steps, Form, message } from 'antd'
import { Scrollbars } from 'react-custom-scrollbars'
import type { Location } from 'umi'
import { history, useLocation } from 'umi'
import BaseSetting from './componetns/BaseSetting'
import CronConfig from './componetns/CronConfig'
import style from './index.less'
import { requestApiDetail } from '../Detail/service'
import { ESchedulerType } from '@/components/XFlow/service'
import { requestCreateApi } from './service'
import moment from 'moment'
import type { CreatePageMode, ICreateTaskItem } from './index.d'
import { CODE } from '@/components/Common/crud'

function getFormInitValues() {
  return {
    updateStrategy: 'all',
    deleteStrategy: 'ignore',
    scheduleType: ESchedulerType.SINGLE,
    timezoneId: 'Asia/Shanghai',
    timerange: [moment(), moment().add(100, 'y')],
  }
}

const TaskCreate: React.FC = () => {
  const [stepCurrent, setstepCurrent] = useState<number>(-1)
  const [form] = Form.useForm()
  const [loading, setloading] = useState<boolean>(false)
  const location: Location = useLocation()
  const forms = useRef<object>(getFormInitValues())

  console.log(location, 'location')

  const id = location.query?.id
  const isEdit = id !== void 0
  const mode: CreatePageMode = isEdit ? 'edit' : 'create'

  const onNext = (e) => {
    e.preventDefault()
    form
      .validateFields()
      .then((value) => {
        Object.assign(forms.current, value)
        setstepCurrent(stepCurrent + 1)
      })
      .catch(() => {})
  }

  const onSubmit = (e) => {
    if (loading) {
      return
    }
    e.preventDefault()
    form
      .validateFields()
      .then((value) => {
        const { catalogue, ...basicForm } = forms.current as ICreateTaskItem
        const params = {
          ...basicForm,
          ...value,
          catalogueId: catalogue?.id,
        }
        if (params.scheduleType !== ESchedulerType.CYCLE) {
          params.cronExpression = null
        }
        setloading(true)
        requestCreateApi(params)
          .then((res) => {
            if (res.code === CODE.SUCCESS) {
              message.success(`${isEdit ? '编辑' : '创建'}成功`)
              history.push('/dataAsset/metaDataManage/taskManage')
            } else {
              message.error(res.msg)
            }
          })
          .finally(() => {
            setloading(false)
          })
      })
      .catch(() => {})
  }

  const getTaskDetail = () => {
    requestApiDetail(id)
      .then(({ code, datas }) => {
        if (code === CODE.SUCCESS) {
          const { catalogueId, path, ...rest } = datas
          Object.assign(forms.current, rest, { catalogue: { id: catalogueId, path } })
        }
      })
      .finally(() => {
        setstepCurrent(0)
      })
  }

  useEffect(() => {
    if (isEdit) {
      getTaskDetail()
    } else {
      setstepCurrent(0)
    }
  }, [])

  const content =
    stepCurrent == 0 ? (
      <BaseSetting mode={mode} form={form} initialValues={forms.current} />
    ) : stepCurrent == 1 ? (
      <CronConfig mode={mode} form={form} initialValues={forms.current} />
    ) : null

  return (
    <PageContainer
      footer={[
        stepCurrent > 0 ? (
          <Button
            key="pre"
            onClick={() => {
              setstepCurrent(stepCurrent - 1)
            }}
          >
            上一步
          </Button>
        ) : null,
        <Button
          key="cancel"
          onClick={() => {
            history.goBack()
          }}
        >
          取消
        </Button>,
        stepCurrent == 0 ? (
          <Button key="next" type="primary" onClick={onNext}>
            下一步
          </Button>
        ) : (
          <Button key="next" type="primary" onClick={onSubmit} loading={loading}>
            提交
          </Button>
        ),
      ]}
    >
      <Steps
        style={{ width: 400 }}
        current={stepCurrent}
        className={style['createpage-step']}
        size="small"
        items={[
          { title: '基本配置' },
          {
            title: '调度属性',
          },
        ]}
      />
      <Scrollbars style={{ height: `calc(100vh - 48px - 72px - 45px - 20px)`, marginTop: 20 }}>
        {content}
      </Scrollbars>
    </PageContainer>
  )
}

export default TaskCreate
