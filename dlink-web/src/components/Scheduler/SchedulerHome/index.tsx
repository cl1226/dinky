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

import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import styles from './index.less'
import { Image, Card, Steps, Row, Spin } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import * as echarts from 'echarts'
import { debounce } from 'lodash'
import { getSchedulerStatistics } from '@/components/Common/crud'
export interface IChartData {
  value: string | number
  name: string
}
export interface ICardChartProps {
  chartName: string
  chartData: IChartData[]
  setChart: (key, chart) => void
}

export enum EChartLabel {
  'sourceNum' = '数据源数',
  'jobNum' = '作业数',
  'flowNum' = '流程数',
  'finished' = '完成',
  'failed' = '失败',
  'processing' = '调度中',
  'success' = '成功',
  'fail' = '失败',
}

const CardChart = (props: ICardChartProps) => {
  const { chartName, chartData, setChart } = props
  const chartsRef = useRef<HTMLDivElement | null>(null)

  const initChart = () => {
    const chartDom = chartsRef.current
    if (!chartDom) return
    const tempChart = echarts.init(chartDom)

    const getValueByName = (name) => {
      return chartData.find((item) => item.name === name)?.value
    }
    const options = {
      tooltip: {
        trigger: 'item',
      },
      legend: {
        top: '30%',
        left: '70%',
        orient: 'vertical',
        icon: 'circle',
        itemWidth: 8,
        show: chartData && chartData.length,
        // 使用回调函数
        formatter: (name) => {
          return `${name} ${getValueByName(name)}`
        },
      },
      series: [
        {
          name: chartName,
          type: 'pie',
          center: ['35%', '45%'],
          radius: ['60%', '70%'],
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
    setChart && setChart(chartName, tempChart)
  }

  useEffect(() => {
    initChart()
  }, [chartData])
  return <div style={{ width: '100%', height: '28vh' }} ref={chartsRef}></div>
}

const SchedulerHome: React.FC = () => {
  const [chartList, setChartList] = useState<any>([
    {
      key: 'develop',
      title: '数据开发',
      data: [],
    },
    {
      key: 'devops',
      title: '作业监控',
      data: [],
    },
    {
      key: 'alert',
      title: '告警监控',
      data: [],
    },
  ])

  const cacheChart = useMemo<{ [key: string]: echarts.ECharts }>(() => ({}), [])
  const [cacheLoading, setCacheLoading] = useState<{ [key: string]: boolean }>(() => ({}))

  const handleCacheChart = (key, chart) => {
    cacheChart[key] = chart
  }

  const refreshChart = async (key) => {
    setCacheLoading({
      ...cacheLoading,
      [key]: true,
    })
    console.log('qianqian', cacheLoading)
    const { datas: currentChartData } = await getSchedulerStatistics(key)
    setCacheLoading({
      ...cacheLoading,
      [key]: false,
    })
    console.log('cacheLoading', cacheLoading, cacheLoading[key])
    const option: any = cacheChart[key].getOption()
    option.series[0].data = Object.keys(currentChartData).map((item) => {
      return {
        value: currentChartData[item],
        name: EChartLabel[item],
      }
    })
  }

  const getChartCard = () => {
    return chartList.map((chartItem) => {
      return useMemo(() => {
        return (
          <Card
            key={chartItem.key}
            className={styles['chart-card']}
            title={chartItem.title}
            bordered={false}
            extra={
              <ReloadOutlined
                onClick={() => refreshChart(chartItem.key)}
                style={{ cursor: 'pointer' }}
              />
            }
          >
            <Spin spinning={!!cacheLoading[chartItem.key]}>
              <CardChart
                chartName={chartItem.key}
                chartData={chartItem.data}
                setChart={handleCacheChart}
              />
            </Spin>
          </Card>
        )
      }, [chartItem.data, cacheLoading[chartItem.key]])
    })
  }

  const onResize = useCallback(
    debounce(() => {
      Object.keys(cacheChart).map((key) => {
        cacheChart[key].resize()
      })
    }, 200),
    [],
  )

  useEffect(() => {
    window.addEventListener('resize', onResize)
    onResize()
    return () => {
      window.removeEventListener('resize', onResize)
    }
  }, [onResize])
  useEffect(() => {
    ~(async () => {
      const chartMaps = {
        develop: '数据开发',
        devops: '作业监控',
        alert: '告警监控',
      }
      const keyList = Object.keys(chartMaps)
      const res = await Promise.all(keyList.map((key) => getSchedulerStatistics(key)))
      const tempList = keyList.map((key, index) => {
        const tempData = res[index]['datas']
        return {
          key,
          title: chartMaps[key],
          data: Object.keys(tempData).map((item) => {
            return {
              value: tempData[item],
              name: EChartLabel[item],
            }
          }),
        }
      })
      setChartList(tempList)
    })()
  }, [])
  return (
    <div
      style={{
        height: '100%',
        overflow: 'hidden',
        background: '#eee',
        paddingLeft: 5,
        paddingRight: 5,
        minWidth: 960,
      }}
    >
      <Card title="快速入门" bordered={false} className={styles['fast-card']}>
        <Steps progressDot={true} current={4} style={{ paddingTop: 150 }}>
          <Steps.Step
            className={styles['step-box']}
            title="项目管理"
            subTitle="根目录与项目一一对应，实现工作流的快速分类。"
            description={<Image src={'schedule/project.png'} preview={false}></Image>}
          />
          <Steps.Step
            className={styles['step-box']}
            title="数据开发"
            subTitle="在线脚本编辑调试、支持多种语法，轻松实现数据开发工作。"
            description={<Image src={'schedule/develop.png'} preview={false}></Image>}
          />
          <Steps.Step
            className={styles['step-box']}
            title="流程开发"
            subTitle="拖拽式作业开发，轻松实现工作流开发工作。"
            description={<Image src={'schedule/workflow.png'} preview={false}></Image>}
          />
          <Steps.Step
            className={styles['step-box']}
            title="运维调度"
            subTitle="强大的作业调度与灵活的作业监控告警，轻松管理数据作业运维。"
            description={<Image src={'schedule/devops.png'} preview={false}></Image>}
          />
        </Steps>
      </Card>
      <Row justify={'space-between'}>{getChartCard()}</Row>
    </div>
  )
}

export default SchedulerHome
