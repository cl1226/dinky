import React, { useEffect, useState } from 'react'
import QnnCron from 'qnn-react-cron'
import { Button, Space, Input, Popover } from 'antd'
import './index.less'
export const Cron: React.FC<any> = (props) => {
  const { placement = 'bottom', value, onChange } = props
  let cronFns
  const [popVisible, setPopVisible] = useState(false)

  const handleOpenChange = (newOpen: boolean) => {
    setPopVisible(newOpen)
  }

  useEffect(() => {
    onChange && onChange(value)
  }, [value])

  const handleCreateTime = () => {}
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
    </span>
  )
}
