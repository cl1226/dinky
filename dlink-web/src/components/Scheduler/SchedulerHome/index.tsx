/*
 *
 *  Licensed to the Apache Software Foundation (ASF) under one or more
 *  contributor license agreements.  See the NOTICE file distributed with
 *  this work for additional information regarding copyright ownership.
 *  The ASF licenses this file to You under the Apache License, Version 2.0
 *  (the "License"); you may not use this file except in compliance with
 *  the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

import { useEffect, useRef, useState, useMemo } from 'react'
import styles from './index.less'
import { Image, Card, Steps, Row, Col } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import * as echarts from 'echarts'

export interface IChartData {
  value: string | number
  name: string
}
export interface ICardChartProps {
  chartName: string
  chartData: IChartData[]
}
const CardChart: React.FC<ICardChartProps> = (props: ICardChartProps) => {
  const { chartName, chartData } = props
  const chartsRef = useRef<HTMLDivElement | null>(null)

  const initChart = () => {
    const chartDom = chartsRef.current
    if (!chartDom) return
    const tempChart = echarts.init(chartDom)
    const options = {
      tooltip: {
        trigger: 'item',
      },
      legend: {
        top: '30%',
        right: '10%',
        orient: 'vertical',
        icon: 'circle',
        itemWidth: 8,
        show: chartData && chartData.length,
      },
      series: [
        {
          name: chartName,
          type: 'pie',
          center: ['35%', '45%'],
          radius: ['70%', '80%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center',
          },
          emphasis: {
            label: {
              show: false,
            },
          },
          labelLine: {
            show: false,
          },
          left: '0',
          data: chartData,
        },
      ],
    }
    tempChart.setOption(options)
  }

  useEffect(() => {
    initChart()
  }, [chartData])
  return <div style={{ width: '100%', height: '100%' }} ref={chartsRef}></div>
}

const SchedulerHome: React.FC = () => {
  const getChartCard = () => {
    const [chartList, setChartList] = useState([
      {
        key: 'develop',
        title: '数据开发',
        data: [
          { value: 1048, name: '脚本数' },
          { value: 735, name: '作业数' },
          { value: 580, name: '资源数' },
        ],
      },
      {
        key: 'script',
        title: '脚本监控',
        data: [
          { value: 1048, name: '脚本数' },
          { value: 735, name: '作业数' },
          { value: 580, name: '资源数' },
        ],
      },
      {
        key: 'dispatch',
        title: '调度监控',
        data: [
          { value: 1048, name: '脚本数' },
          { value: 735, name: '作业数' },
          { value: 580, name: '资源数' },
        ],
      },
    ])

    const refreshChart = async (key) => {
      const tempList = chartList.map((item) => {
        if (item.key === key) {
          return {
            ...item,
            data: [],
          }
        }
        return item
      })
      setChartList(tempList)
    }

    return chartList.map((chartItem) => {
      return useMemo(() => {
        return (
          <Card
            key={chartItem.key}
            className={styles['chart-card']}
            title={chartItem.title}
            extra={
              <ReloadOutlined
                onClick={() => refreshChart(chartItem.key)}
                style={{ cursor: 'pointer' }}
              />
            }
          >
            <CardChart chartName={chartItem.key} chartData={chartItem.data} />
          </Card>
        )
      }, [chartItem.data])
    })
  }
  return (
    <div style={{ height: '100%', background: '#eee', paddingLeft: 5, paddingRight: 5 }}>
      <Card title="快速入门" bordered={false}>
        <Row justify="space-between">
          <Col span={3}>
            <Image style={{ width: '150px' }} src={'schedule/project.png'} preview={false}></Image>
          </Col>
          <Col span={3}>
            <Image style={{ width: '150px' }} src={'schedule/develop.png'} preview={false}></Image>
          </Col>
          <Col span={3}>
            <Image style={{ width: '150px' }} src={'schedule/workflow.png'} preview={false}></Image>
          </Col>
          <Col span={3}>
            <Image style={{ width: '150px' }} src={'schedule/devops.png'} preview={false}></Image>
          </Col>
        </Row>
        <Steps
          current={4}
          progressDot={(dot, { status, index }) => <>{dot}</>}
          items={[
            {
              title: '项目管理',
              subTitle: '根目录与项目一一对应，实现工作流的快速分类。',
            },
            {
              title: '数据开发',
              subTitle: '在线脚本编辑调试、支持多种语法，轻松实现数据开发工作。',
            },
            {
              title: '流程开发',
              subTitle: '拖拽式作业开发，轻松实现工作流开发工作。',
            },
            {
              title: '运维调度',
              subTitle: '强大的作业调度与灵活的作业监控告警，轻松管理数据作业运维。',
            },
          ]}
        />
      </Card>
      <Row justify={'space-between'}>{getChartCard()}</Row>
    </div>
  )
}

export default SchedulerHome
