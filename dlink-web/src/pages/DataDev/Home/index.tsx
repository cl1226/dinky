import React from 'react'
import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import styles from './index.less'
import { Card, Spin, Row, Col } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-layout'
import { getSchedulerStatistics } from '@/components/Common/crud'
import * as echarts from 'echarts'
import { debounce } from 'lodash'

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

export interface IChartData {
  value: string | number
  name: string
}
export interface ICardChartProps {
  chartName: string
  chartData: IChartData[]
  setChart: (key, chart) => void
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
    const { datas: currentChartData } = await getSchedulerStatistics(key)
    setCacheLoading({
      ...cacheLoading,
      [key]: false,
    })
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
      return (
        <Col span="8">
          <Card
            size={'small'}
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
              {useMemo(
                () => (
                  <CardChart
                    chartName={chartItem.key}
                    chartData={chartItem.data}
                    setChart={handleCacheChart}
                  />
                ),
                [chartItem.data],
              )}
            </Spin>
          </Card>
        </Col>
      )
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
    <PageContainer title={false}>
      <Card title="快速入门" bordered={false}>
        <StepGuide steps={stepList} />
      </Card>
      <Row justify={'space-between'} gutter={12}>
        {getChartCard()}
      </Row>
    </PageContainer>
  )
}

export default DataDevHome
