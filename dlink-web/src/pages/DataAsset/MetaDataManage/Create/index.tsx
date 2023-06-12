import { useRef, useState } from 'react'
import { PageContainer } from '@ant-design/pro-components'
import { Button, Steps, Form } from 'antd'
import { Scrollbars } from 'react-custom-scrollbars'
import { history } from 'umi'
import BaseSetting from './componetns/BaseSetting'
import style from './index.less'

const TaskCreate: React.FC = () => {
  const [stepCurrent, setstepCurrent] = useState<number>(0)
  const [form] = Form.useForm()
  const forms = useRef<object>({})

  const onNext = (e) => {
    e.preventDefault()
    form
      .validateFields()
      .then((value) => {
        console.log(value)
        forms.current[stepCurrent] = value
        setstepCurrent(stepCurrent + 1)
      })
      .catch(() => {})
  }

  const onSubmit = (e) => {
    //   e.preventDefault()
    //   const { catalogue, ...basicForm } = forms[0]
    //   const params = {
    //     catalogueId: catalogue.id,
    //     ...basicForm,
    //     ...forms[1],
    //   }
    //   requestCreateApi(params).then((res) => {
    //     if (res.code === CODE.SUCCESS) {
    //       message.success('创建成功')
    //       history.push('/dataService/devApi/catalogue')
    //     } else {
    //       message.error(res.msg)
    //     }
    //   })
  }

  const content =
    stepCurrent == 0 ? (
      <BaseSetting mode="create" form={form} values={forms.current[stepCurrent]} />
    ) : (
      <div></div>
    )

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
          <Button key="next" type="primary" onClick={onSubmit}>
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
