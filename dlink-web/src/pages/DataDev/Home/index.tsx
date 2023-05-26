import React from 'react'
import styles from './index.less'
import { Card } from 'antd'
import { PageContainer } from '@ant-design/pro-layout'

export interface IStepItem {
  title: string
  image: string
  detail: string
}
export const StepGuide: React.FC<{ steps: IStepItem[] }> = (props) => {
  const { steps } = props
  return (
    <ul className={styles['step-guide']}>
      {steps.map((step, index) => {
        return (
          <li key={index} style={{ width: `${100 / steps.length}%` }}>
            <div
              className="guide-desc"
            >
              <div className="img-box">
                <img src={step.image} alt="" />
              </div>
              <div className="title-box">
                <div className="num-box">{index + 1}</div>
                <div className="text-box">{step.title}</div>
              </div>
              <div className="detail-box">{step.detail}</div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
const DataDevHome: React.FC<{}> = (props: any) => {
  const stepList: IStepItem[] = [
    {
      title: '数据管理',
      image: '/schedule/project.png',
      detail:
        '数据表管理，根据您的业务需求设计并新建数据模型。',
    },
    {
      title: 'API开发',
      image: '/schedule/develop.png',
      detail:
        '在线脚本编辑调试、拖拽式作业开发，轻松实现数据开发工作。',
    },
    {
      title: 'API管理',
      image: '/schedule/workflow.png',
      detail: '拖拽式作业开发，轻松实现工作流开发工作。',
    },
    {
      title: 'API监控',
      image: '/schedule/devops.png',
      detail: '强大的作业调度与灵活的作业监控告警，轻松管理数据作业运维。',
    },
  ]
  return (
    <PageContainer title={false}>
      <Card title="快速入门" bordered={false}>
        <StepGuide steps={stepList} />
      </Card>
    </PageContainer>
  )
}

export default DataDevHome
