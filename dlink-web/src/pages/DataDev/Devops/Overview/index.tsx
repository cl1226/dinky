import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import styles from './index.less'
import * as echarts from 'echarts'
import PageWrap from '@/components/Common/PageWrap'
import { Table, Row, Col, DatePicker } from 'antd'
import moment from 'moment'
import type { Moment } from 'moment'

import {
  getTaskStateCount,
  getFlowStateCount,
  getTaskDefineCount,
} from '@/pages/DataDev/Devops/service'
const RangePicker: any = DatePicker.RangePicker
type RangeValue = [Moment, Moment]

const PieChart = (props) => {
  const { chartData } = props
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
        bottom: '0',
        left: 'center',
      },
      series: [
        {
          type: 'pie',
          center: ['50%', '45%'],
          radius: ['65%', '85%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center',
          },
          labelLine: {
            show: false,
          },
          data: chartData,
        },
      ],
    }
    tempChart.setOption(options)
  }

  useEffect(() => {
    initChart()
  }, [chartData])

  return <div style={{ width: '100%', height: 550 }} ref={chartsRef}></div>
}

const BarChart = (props) => {
  const { chartData } = props
  const chartsRef = useRef<HTMLDivElement | null>(null)

  const initChart = () => {
    const chartDom = chartsRef.current
    if (!chartDom) return
    const tempChart = echarts.init(chartDom)
    const options = {
      grid: {
        left: '10',
        right: '10',
        bottom: '30',
        top: '20',
        containLabel: true,
      },
      tooltip: {
        trigger: 'axis',
      },
      xAxis: {
        type: 'category',
        data: chartData.x || [],
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          data: chartData.y,
          type: 'bar',
          barMaxWidth: 100,
        },
      ],
    }
    tempChart.setOption(options)
  }

  useEffect(() => {
    initChart()
  }, [chartData])

  return <div style={{ width: '100%', height: 400 }} ref={chartsRef}></div>
}

const columns = [
  {
    title: '#',
    dataIndex: 'key',
    key: 'key',
    render: (text, record, index) => `${index + 1}`,
    width: 40,
  },
  {
    title: '数量',
    dataIndex: 'count',
    key: 'count',
    width: 60,
  },
  {
    title: '状态',
    dataIndex: 'state',
    key: 'state',
    width: 80,
  },
]

export default () => {
  const [taskDateRange, setTaskDateRange] = useState<RangeValue>([
    moment(moment().format('YYYY-MM-DD')),
    moment(),
  ])
  const [taskChartData, setTaskChartData] = useState<any>([])
  const [taskTableData, setTaskTableData] = useState<any>([])

  const [flowDateRange, setFlowDateRange] = useState<RangeValue>([
    moment(moment().format('YYYY-MM-DD')),
    moment(),
  ])
  const [flowChartData, setFlowChartData] = useState<any>([])
  const [flowTableData, setFlowTableData] = useState<any>([])

  const [flowDefineData, setFlowDefineData] = useState<any>({ x: [], y: [] })

  const getTaskData = async (startDate, endDate) => {
    const { chartList, tableList } = await getTaskStateCount({
      startDate: startDate.format('YYYY-MM-DD HH:mm:ss'),
      endDate: endDate.format('YYYY-MM-DD HH:mm:ss'),
    })

    setTaskChartData(chartList)
    setTaskTableData(tableList)
  }

  const getFlowData = async (startDate, endDate) => {
    const { chartList, tableList } = await getFlowStateCount({
      startDate: startDate.format('YYYY-MM-DD HH:mm:ss'),
      endDate: endDate.format('YYYY-MM-DD HH:mm:ss'),
    })
    setFlowChartData(chartList)
    setFlowTableData(tableList)
  }

  const getTaskDefineData = async () => {
    const result = await getTaskDefineCount()
    setFlowDefineData(result)
  }
  useEffect(() => {
    getTaskData(taskDateRange[0], taskDateRange[1])
    getFlowData(flowDateRange[0], flowDateRange[1])
    getTaskDefineData()
  }, [])
  return (
    <PageWrap>
      <Row style={{ minWidth: 1020 }}>
        <Col span={12} style={{ paddingRight: 10 }}>
          <div className={styles['chart-title']}>
            <h3>任务状态统计</h3>
            <RangePicker
              allowClear={false}
              showTime
              value={taskDateRange}
              onChange={(date) => {
                setTaskDateRange(date)
              }}
              onOpenChange={(bool) => {
                !bool && getTaskData(taskDateRange[0], taskDateRange[1])
              }}
            />
          </div>
          <Row>
            <Col span={14}>
              <PieChart chartData={taskChartData}></PieChart>
            </Col>
            <Col span={9}>
              <Table
                size="small"
                rowKey={'rowIndex'}
                columns={columns}
                dataSource={taskTableData}
                pagination={false}
              />
            </Col>
          </Row>
        </Col>
        <Col span={12} style={{ paddingRight: 10 }}>
          <div className={styles['chart-title']}>
            <h3>流程状态统计</h3>
            <RangePicker
              allowClear={false}
              showTime
              value={taskDateRange}
              onChange={(date) => {
                setFlowDateRange(date)
              }}
              onOpenChange={(bool) => {
                !bool && getFlowData(flowDateRange[0], flowDateRange[1])
              }}
            />
          </div>
          <Row>
            <Col span={14}>
              <PieChart chartData={flowChartData}></PieChart>
            </Col>
            <Col span={9}>
              <Table
                size="small"
                rowKey={'rowIndex'}
                columns={columns}
                dataSource={flowTableData}
                pagination={false}
              />
            </Col>
          </Row>
        </Col>
      </Row>
      <Row style={{ marginTop: 30 }}>
        <div className={styles['chart-title']}>
          <h3>流程定义统计</h3>
        </div>
        <BarChart chartData={flowDefineData}></BarChart>
      </Row>
    </PageWrap>
  )
}
