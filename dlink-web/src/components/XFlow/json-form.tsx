import React, { useState } from 'react'
import { NsJsonSchemaForm, MODELS } from '@antv/xflow'
import moment from 'moment'
import { Descriptions, Radio, DatePicker, Input, Form } from 'antd'
import type { RadioChangeEvent } from 'antd'
import type { RangePickerProps } from 'antd/es/date-picker'
import { Cron } from '@/components/Cron'

import { IMeta } from './service'

const RangePicker: any = DatePicker.RangePicker

enum ESchedulerType {
  'SINGLE' = 'SINGLE',
  'CYCLE' = 'CYCLE',
}

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
    const [form] = Form.useForm()
    const [baseInfo, setBaseInfo] = useState<IMeta>({ flowId: '' })
    const [schedulerType, setSchedulerType] = useState<ESchedulerType>()

    const [cycleForm, setCycleForm] = useState<any>({})

    const onSchedulerTypeChange = (e: RadioChangeEvent) => {
      setSchedulerType(e.target.value), console.log('e.target.value', e.target.value)
    }

    // 将当前组件的meta转换为传参的meta
    const getJsonMeta = (meta) => {
      const { schedulerType: scheduler, timerange, crontab, timezoneId, ...reaminMeta } = meta
      console.log('getJsonMeta', scheduler)
      let tempCron: any = null
      if (scheduler === ESchedulerType.CYCLE) {
        tempCron = {}
        tempCron.timezoneId = timezoneId
        tempCron.crontab = crontab
        const [startTime, endTime] = timerange || []
        if (startTime && endTime) {
          tempCron.startTime = moment(startTime).format('YYYY-MM-DD HH:mm:ss')
          tempCron.endTime = moment(endTime).format('YYYY-MM-DD HH:mm:ss')
        }
      }
      return {
        ...reaminMeta,
        schedulerType: scheduler,
        cron: JSON.stringify(tempCron),
      }
    }

    const refreshGrapMeta = async (newResult = {} as any) => {
      const graphMeta = await MODELS.GRAPH_META.useValue(modelService)
      const graphMetaModel = await MODELS.GRAPH_META.getModel(modelService)

      const result = {
        ...graphMeta.meta,
        ...newResult,
      }
      console.log(newResult, result)
      graphMetaModel.setValue({
        ...graphMeta,
        meta: getJsonMeta(result),
      })
    }

    const onFieldChange = (fields) => {
      const formData = {}
      fields.forEach((item) => {
        formData[item.name[0]] = item.value
      })

      setCycleForm(formData)
    }

    const getCycleFormField = (formObj) => {
      return Object.keys(formObj).map((key) => {
        return {
          name: [key],
          value: formObj[key],
        }
      })
    }

    React.useEffect(() => {
      ~(async () => {
        const model = await MODELS.GRAPH_META.getModel(modelService)
        model.watch(async (value) => {
          const { schedulerType: scheduler, cron, ...remainMeta } = value.meta
          console.log('watch', scheduler)
          setBaseInfo(remainMeta)
          setSchedulerType(scheduler)
          if (scheduler === ESchedulerType.CYCLE) {
            if (cron) {
              let timerange: any = []
              const { startTime, endTime, timezoneId, crontab } = JSON.parse(cron)
              if (startTime && endTime) {
                timerange = [moment(startTime), moment(endTime)]
              }

              setCycleForm({
                timerange,
                timezoneId,
                crontab,
              })
            }
          } else {
            setCycleForm({})
          }
        })
      })()
    }, [])

    return (
      <div className="custom-form-component">
        <div className="info-title">作业信息</div>
        <div className="info-wrap">
          <div className="info-content">
            <Descriptions title="基本信息" column={1}>
              <Descriptions.Item label="作业ID">{baseInfo.flowId}</Descriptions.Item>
              <Descriptions.Item label="作业名称">{baseInfo.flowName}</Descriptions.Item>
              <Descriptions.Item label="作业状态">{baseInfo.status}</Descriptions.Item>
            </Descriptions>
            <Form
              name="basic"
              form={form}
              fields={getCycleFormField(cycleForm)}
              onFieldsChange={(_, allFields) => {
                onFieldChange(allFields)
              }}
            >
              <Descriptions title="调度配置" column={1} layout="vertical">
                <Descriptions.Item label="调度方式">
                  <Radio.Group onChange={onSchedulerTypeChange} value={schedulerType}>
                    <Radio value={ESchedulerType.SINGLE}>单次调度</Radio>
                    <Radio value={ESchedulerType.CYCLE}>周期调度</Radio>
                  </Radio.Group>
                </Descriptions.Item>
                {schedulerType === ESchedulerType.CYCLE ? (
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
        </div>
      </div>
    )
  }
}
