import { Cron } from '@/components/Cron'
import { ESchedulerType } from '@/components/XFlow/service'
import { Card, Form, Input, DatePicker, Radio } from 'antd'
import type { ICreateTaskStepComProps } from '../../index.d'

const RangePicker: any = DatePicker.RangePicker

const CronConfig = ({ initialValues, form, mode }: ICreateTaskStepComProps) => {
  return (
    <Form
      name="cron"
      labelCol={{ span: 4 }}
      wrapperCol={{ span: 8 }}
      labelAlign="left"
      form={form}
      initialValues={initialValues}
      autoComplete="off"
    >
      <Card title={null} bordered={false}>
        <Form.Item
          label="调度方式"
          name="scheduleType"
          rules={[{ required: true, message: '请选择调度方式!' }]}
        >
          <Radio.Group>
            <Radio value={ESchedulerType.SINGLE}>单次调度</Radio>
            <Radio value={ESchedulerType.CYCLE}>周期调度</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.scheduleType !== currentValues.scheduleType
          }
        >
          {({ getFieldValue }) =>
            getFieldValue('scheduleType') == ESchedulerType.CYCLE ? (
              <>
                <Form.Item
                  label="起止时间"
                  name="timerange"
                  rules={[{ required: true, message: '请选择起止时间！' }]}
                  style={{ width: '100%' }}
                >
                  <RangePicker showTime />
                </Form.Item>
                <Form.Item
                  label="定时"
                  name="cronExpression"
                  rules={[{ required: true, message: '请选择定时！' }]}
                  style={{ width: '100%' }}
                >
                  <Cron />
                </Form.Item>
                <Form.Item
                  label="时区"
                  name="timezoneId"
                  rules={[{ required: true, message: '请选择时区！' }]}
                  style={{ width: '100%' }}
                >
                  <Input readOnly />
                </Form.Item>
              </>
            ) : null
          }
        </Form.Item>
      </Card>
    </Form>
  )
}

export default CronConfig
