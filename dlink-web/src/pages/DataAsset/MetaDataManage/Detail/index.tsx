import { useEffect, useState } from 'react'
import { useParams, history } from 'umi'
import type { ITaskItem } from '../Create/index.d'
import { requestApiDetail } from './service'
import { CODE } from '@/components/Common/crud'
import { Scrollbars } from 'react-custom-scrollbars'
import { PageContainer } from '@ant-design/pro-layout'
import BaseConfig from './BasicConfig'
import { Button, Card, Descriptions } from 'antd'
import style from './index.less'
import { ESchedulerType, ESchedulerTypeMap } from '@/components/XFlow/service'

export interface ITabComponentProps {
  detail: ITaskItem
}

const TaskDetail: React.FC = () => {
  const [taskDetail, settaskDetail] = useState<ITaskItem>()
  const [loading, setloading] = useState<boolean>(false)
  const [activeKey, setactiveKey] = useState<string>('base')
  const params: { id: string; [prop: string]: any } = useParams()

  const getTaskDetail = () => {
    setloading(true)
    requestApiDetail(Number(params.id))
      .then(({ code, datas }) => {
        if (code === CODE.SUCCESS) {
          settaskDetail(datas)
        }
      })
      .finally(() => {
        setloading(false)
      })
  }

  useEffect(() => {
    getTaskDetail()
  }, [])

  return (
    <PageContainer
      className={style['detail-page-container']}
      footer={[
        <Button
          key="edit"
          onClick={() => {
            history.push(`/dataAsset/metaDataManage/create?id=${params.id}`)
          }}
        >
          编辑
        </Button>,
      ]}
      title={taskDetail?.name}
      onBack={() => history.goBack()}
      loading={loading}
      tabList={[
        {
          tab: '基本配置',
          key: 'base',
        },
        {
          tab: '调度属性',
          key: 'info',
        },
      ]}
      onTabChange={(_activeKey) => {
        setactiveKey(_activeKey)
      }}
    >
      <Scrollbars style={{ height: 'calc(100vh - 48px - 140px - 96px)' }}>
        {activeKey == 'base' ? (
          <BaseConfig detail={taskDetail} />
        ) : (
          <Card>
            <Descriptions colon={false} column={2} labelStyle={{ width: 200 }}>
              <Descriptions.Item label="调度方式">
                {taskDetail?.scheduleType && ESchedulerTypeMap[taskDetail.scheduleType]}
              </Descriptions.Item>
              {taskDetail?.scheduleType == ESchedulerType.CYCLE && (
                <Descriptions.Item label="调度周期">{taskDetail?.cronExpression}</Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        )}
      </Scrollbars>
    </PageContainer>
  )
}

export default TaskDetail
