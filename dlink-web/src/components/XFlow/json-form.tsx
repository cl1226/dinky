import React, { useState } from 'react'
import { NsJsonSchemaForm, MODELS } from '@antv/xflow'
import moment from 'moment'
import { Descriptions, Radio, DatePicker, Input, Form } from 'antd'
import type { RadioChangeEvent } from 'antd'
import { Cron } from '@/components/Cron'
import { NS_CANVAS_FORM } from './config-model-service'
import { IMeta, ESchedulerType, getJsonCron } from './service'
import { Scrollbars } from 'react-custom-scrollbars'

const RangePicker: any = DatePicker.RangePicker

export namespace CustomJsonForm {
  export const getCustomRenderComponent: NsJsonSchemaForm.ICustomRender = (
    targetType,
    targetData,
    modelService,
    commandService,
  ) => {
    if (targetType === 'canvas') {
      return CustomJsonForm.CanvasCustomRender
    }

    return null
  }

  export const CanvasCustomRender: React.FC<NsJsonSchemaForm.ICustomProps> = (props) => {
    const { modelService } = props
    const [canvasForm] = Form.useForm()
    const [baseInfo, setBaseInfo] = useState<IMeta>({ flowId: '' })
    const [cycleVisible, setCycleVisible] = useState<boolean>(false)
    const sref: any = React.createRef<Scrollbars>()

    const registerModel = async () => {
      if (!modelService.findDeferredModel(NS_CANVAS_FORM.id)) {
        modelService.registerModel({
          id: NS_CANVAS_FORM.id,
          getInitialValue: () => {
            return {
              canvasForm: canvasForm,
            }
          },
        })
        return
      } else {
        const ctx = await modelService.awaitModel<NS_CANVAS_FORM.ICanvasForm>(NS_CANVAS_FORM.id)

        ctx.setValue({
          canvasForm: canvasForm,
        })
      }
    }

    const compareMeta = (meta: any) => {
      const { schedulerType, cron } = meta
      if (!schedulerType) return true
      const fieldValues = canvasForm.getFieldsValue(true)

      if (schedulerType === ESchedulerType.SINGLE) {
        return schedulerType === fieldValues.schedulerType
      } else if (schedulerType === ESchedulerType.CYCLE) {
        return cron === getJsonCron(fieldValues)
      }
      return false
    }
    React.useEffect(() => {
      ~(async () => {
        const model = await MODELS.GRAPH_META.getModel(modelService)
        model.watch(async (value) => {
          const { schedulerType, cron, ...remainMeta } = value.meta
          setBaseInfo(remainMeta)
          if (compareMeta(value.meta)) return

          if (schedulerType === ESchedulerType.CYCLE) {
            if (cron) {
              let timerange: any = []
              const { startTime, endTime, timezoneId, crontab } = JSON.parse(cron)
              if (startTime && endTime) {
                timerange = [moment(startTime), moment(endTime)]
              }

              canvasForm.setFieldsValue({
                schedulerType,
                timerange,
                timezoneId,
                crontab,
              })
              setCycleVisible(true)
              return
            }
          }
          canvasForm.setFieldsValue({
            schedulerType: ESchedulerType.SINGLE,
          })
          setCycleVisible(false)
        })
      })()

      registerModel()
    }, [])

    return (
      <div className="custom-form-component">
        <div className="info-title">作业信息</div>
        <div className="info-wrap">
          <Scrollbars style={{ height: '100%' }} ref={sref}>
            <div className="info-content">
              <Descriptions title="基本信息" column={1}>
                <Descriptions.Item label="作业ID">{baseInfo.flowId}</Descriptions.Item>
                <Descriptions.Item label="作业名称">{baseInfo.flowName}</Descriptions.Item>
                <Descriptions.Item label="作业状态">{baseInfo.status}</Descriptions.Item>
              </Descriptions>
              <Form
                name="canvasForm"
                form={canvasForm}
                initialValues={{
                  timezoneId: 'Asia/Shanghai',
                  timerange: [moment(), moment().add(100, 'y')],
                  schedulerType: ESchedulerType.SINGLE,
                }}
              >
                <Descriptions title="调度配置" column={1} layout="vertical">
                  <Descriptions.Item label="调度方式">
                    <Form.Item name="schedulerType" style={{ width: '100%', marginBottom: 0 }}>
                      <Radio.Group
                        onChange={(e: RadioChangeEvent) => {
                          setCycleVisible(e.target.value === ESchedulerType.CYCLE)
                        }}
                      >
                        <Radio value={ESchedulerType.SINGLE}>单次调度</Radio>
                        <Radio value={ESchedulerType.CYCLE}>周期调度</Radio>
                      </Radio.Group>
                    </Form.Item>
                  </Descriptions.Item>

                  {cycleVisible ? (
                    <>
                      <Descriptions.Item key="timerange" label="起止时间">
                        <Form.Item
                          name="timerange"
                          rules={[{ required: true, message: '请选择起止时间！' }]}
                          style={{ width: '100%' }}
                        >
                          <RangePicker showTime />
                        </Form.Item>
                      </Descriptions.Item>
                      <Descriptions.Item key="crontab" label="定时">
                        <Form.Item
                          name="crontab"
                          rules={[{ required: true, message: '请选择定时！' }]}
                          style={{ width: '100%' }}
                        >
                          <Cron />
                        </Form.Item>
                      </Descriptions.Item>
                      <Descriptions.Item key="timezoneId" label="时区">
                        <Form.Item
                          name="timezoneId"
                          rules={[{ required: true, message: '请选择时区！' }]}
                          style={{ width: '100%' }}
                        >
                          <Input readOnly />
                        </Form.Item>
                      </Descriptions.Item>
                    </>
                  ) : null}
                </Descriptions>
              </Form>
            </div>
          </Scrollbars>
        </div>
      </div>
    )
  }
}
