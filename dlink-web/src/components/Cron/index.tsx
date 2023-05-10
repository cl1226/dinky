import React, { useEffect, useState } from 'react'
import QnnCron from 'qnn-react-cron'
import { Button, Space, Input, Popover, message } from 'antd'
import './index.less'
import { CODE, previewCronSchedule } from '@/components/Common/crud'
import { l } from '@/utils/intl'

export const Cron: React.FC<any> = (props) => {
  const { placement = 'bottom', value, onChange } = props
  let cronFns
  const [popVisible, setPopVisible] = useState(false)
  const [previewSchedule, setPreviewSchedule] = useState<string[]>([])

  const handleOpenChange = (newOpen: boolean) => {
    setPopVisible(newOpen)
  }

  useEffect(() => {
    onChange && onChange(value)
  }, [value])

  const handleCreateTime = async () => {
    if (!value) {
      return message.error('请选择定时！')
    }
    try {
      const { code, msg, datas } = await previewCronSchedule(
        '/api/workflow/task/previewSchedule',
        value,
      )
      if (code == CODE.SUCCESS) {
        setPreviewSchedule(datas)
      } else {
        message.warn(msg)
      }
    } catch (err) {
      message.error(l('app.request.error'))
    }
  }
  return (
    <span className="cron-wrap">
      <Space.Compact style={{ width: '100%' }}>
        <Popover
          content={
            <div style={{ width: '520px' }}>
              <QnnCron
                value={value}
                getCronFns={(_cronFns) => {
                  cronFns = _cronFns
                }}
                footer={[
                  <Button
                    key="cencel"
                    style={{ marginRight: 10 }}
                    onClick={() => {
                      onChange && onChange('')
                    }}
                  >
                    重置
                  </Button>,
                  <Button
                    key="getValue"
                    type="primary"
                    onClick={() => {
                      onChange && onChange(cronFns.getValue())
                      setPopVisible(false)
                    }}
                  >
                    生成
                  </Button>,
                ]}
              />
            </div>
          }
          trigger="click"
          open={popVisible}
          onOpenChange={handleOpenChange}
          placement={placement}
          overlayClassName="cron-pop-wrap"
        >
          <Input placeholder="请选择" value={value} />
        </Popover>

        <Button onClick={handleCreateTime}>生成时间</Button>
      </Space.Compact>

      <div className="preview-schedule">
        {previewSchedule.length ? <div>接下来五次执行时间：</div> : null}
        {previewSchedule.map((item) => (
          <div key={item}>{item}</div>
        ))}
      </div>
    </span>
  )
}
