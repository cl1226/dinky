import { useState, useEffect } from 'react'
import { Card, Row } from 'antd'
import type { IStepItem } from '@/pages/DataService/ServiceHome'
import { StepGuide } from '@/pages/DataService/ServiceHome'
import CurStatistic from './components/CurStatistic'
import OldStatistic from './components/OldStatistic'
import PageWrap from '@/components/Common/PageWrap'

export default () => {
  const [activeTabKey, setactiveTabKey] = useState<string>('tab1')

  const stepList: IStepItem[] = [
    {
      title: '新建任务',
      url: '/dataAsset/metaDataManage/create',
      image: '/dataAsset/1.png',
      detail: '点击任务管理的新建，即可创建新任务。',
    },
    {
      title: '配置通用信息',
      image: '/dataAsset/2.png',
      detail: '配置基本信息和数据源信息，支持DLI、DWS、OBS等多种数据源。',
    },
    {
      title: '配置任务信息',
      image: '/dataAsset/3.png',
      detail: '可支持三种数据类型，包括数据概要、数据分类、数据脱敏。',
    },
    {
      title: '任务监控',
      url: '/dataAsset/metaDataManage/taskMonitoring',
      image: '/dataAsset/4.png',
      detail: '监控任务运行情况，查看采集日志，支持采集任务重跑等操作。',
    },
  ]

  const tabList = [
    {
      key: 'tab1',
      tab: '当日统计',
    },
    // {
    //   key: 'tab2',
    //   tab: '历史统计',
    // },
  ]

  const contentList: Record<string, React.ReactNode> = {
    tab1: <CurStatistic />,
    tab2: <OldStatistic />,
  }

  const onTabChange = (key: string) => {
    setactiveTabKey(key)
  }
  return (
    <PageWrap backgroundColor="unset">
      <Card title="快速入门" bordered={false}>
        <StepGuide steps={stepList} />
      </Card>

      <Card
        style={{ marginTop: '15px' }}
        title="数据连接"
        bordered={false}
        tabList={tabList}
        activeTabKey={activeTabKey}
        onTabChange={onTabChange}
        headStyle={{ borderBottomWidth: 0 }}
        bodyStyle={{ minHeight: 300 }}
      >
        {contentList[activeTabKey]}
      </Card>
    </PageWrap>
  )
}
