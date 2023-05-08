import React, { useState } from 'react'
import { NsJsonSchemaForm, MODELS, useXFlowApp } from '@antv/xflow'
import { IMeta } from './service'
import { Descriptions, Radio, DatePicker, Input, Button } from 'antd'
import moment from 'moment'
import { Cron } from '@/components/Cron'
import type { RadioChangeEvent } from 'antd'
import type { RangePickerProps } from 'antd/es/date-picker'
const { RangePicker } = DatePicker

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
    const [baseInfo, setBaseInfo] = useState<IMeta>({ flowId: '' })
    const [schedulerType, setSchedulerType] = useState<ESchedulerType>()
    const [timeRange, setTimeRange] = useState<any>([])

    const app = useXFlowApp()

    const onSchedulerTypeChange = (e: RadioChangeEvent) => {
      console.log('radio checked', e.target.value)
      setSchedulerType(e.target.value)
      refreshGrapMeta({ schedulerType: e.target.value })
    }

    const onRangeChange: RangePickerProps['onChange'] = (date, dateString) => {
      console.log(date, dateString)
      setTimeRange(date)
      refreshGrapMeta({ timeRange: dateString })
    }

    // 将当前组件的meta转换为传参的meta
    const getJsonMeta = (meta) => {
      const { schedulerType: tempSchedulerType, timeRange, cron, ...reaminMeta } = meta

      let tempCron: any = null
      if (tempSchedulerType === ESchedulerType.CYCLE) {
        tempCron = {}
        tempCron.timezoneId = 'Asia/Shanghai'
        const [startTime, endTime] = timeRange || []
        if (startTime && endTime) {
          tempCron.startTime = startTime
          tempCron.endTime = endTime
        }
      }
      return {
        ...reaminMeta,
        schedulerType: tempSchedulerType,
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
      graphMetaModel.setValue({
        ...graphMeta,
        meta: getJsonMeta(result),
      })
    }

    React.useEffect(() => {
      ~(async () => {
        const model = await MODELS.GRAPH_META.getModel(modelService)
        model.watch(async (value) => {
          const { schedulerType, cron, ...remainMeta } = value.meta
          setBaseInfo(remainMeta)
          setSchedulerType(schedulerType)
          if (schedulerType === ESchedulerType.CYCLE) {
            if (cron) {
              const { startTime, endTime } = JSON.parse(cron)
              if (startTime && endTime) {
                setTimeRange([moment(startTime), moment(endTime)])
              }
            }
          } else {
            setTimeRange([])
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
            <Descriptions title="调度配置" column={1} layout="vertical">
              <Descriptions.Item label="调度方式">
                <Radio.Group onChange={onSchedulerTypeChange} value={schedulerType}>
                  <Radio value={ESchedulerType.SINGLE}>单次调度</Radio>
                  <Radio value={ESchedulerType.CYCLE}>周期调度</Radio>
                </Radio.Group>
              </Descriptions.Item>
              {schedulerType === ESchedulerType.CYCLE ? (
                <>
                  <Descriptions.Item key="time" label="起止时间">
                    <RangePicker
                      format={'YYYY-MM-DD HH:mm:ss'}
                      showTime
                      value={timeRange}
                      onChange={onRangeChange}
                    />
                  </Descriptions.Item>
                  <Descriptions.Item key="crontab" label="定时">
                    <Cron />
                  </Descriptions.Item>
                  <Descriptions.Item key="timezone" label="时区">
                    <Input value="Asia/Shanghai" readOnly />
                  </Descriptions.Item>
                </>
              ) : null}
            </Descriptions>
          </div>
        </div>
      </div>
    )
  }
}
