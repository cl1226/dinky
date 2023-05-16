import React from 'react'
import styles from './index.less'
import { Card } from 'antd'
import { PageContainer } from '@ant-design/pro-layout'
import { history } from 'umi'

export interface IStepItem {
  title: string
  url: string
  image: string
  detail: string
}
export const StepGuide: React.FC<{ steps: IStepItem[] }> = (props) => {
  const { steps } = props
  return (
    <ul className={styles['step-guide']}>
      {steps.map((step, index) => {
        return (
          <li style={{ width: `${100 / steps.length}%` }}>
            <div
              className="guide-desc"
              onClick={() => {
                history.push(step.url)
              }}
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
const ServiceHome: React.FC<{}> = (props: any) => {
  const stepList: IStepItem[] = [
    {
      title: '新建目录',
      url: '/dataService/devApi/catalogue',
      image: '/dataService/1.png',
      detail:
        'API目录是按一定次序编排记录的API索引，为反映类别、指导使用、检索API的工具，帮助API开发者对API服务进行有效的分类和管理',
    },
    {
      title: 'API开发',
      url: '/dataService/devApi/create',
      image: '/dataService/2.png',
      detail:
        '通过自定义SQL的脚本或编写API的查询SQL，并支持多表关联、复杂查询条件以及聚合函数等能力。可以在线调试，方便问题排查',
    },
    {
      title: 'API管理',
      url: '/dataService/devApi/management',
      image: '/dataService/3.png',
      detail: 'API服务上下线，对数据服务的生命周期进行管理。授予、收回API的访问权限',
    },
    {
      title: 'API监控',
      url: '/dataService/serviceDashboard',
      image: '/dataService/4.png',
      detail: '监控开发的API，了解被使用情况。可定制化监控指标',
    },
  ]
  return (
    <PageContainer title={false}>
      <Card title="操作指引" bordered={false}>
        <StepGuide steps={stepList} />
      </Card>
    </PageContainer>
  )
}

export default ServiceHome
