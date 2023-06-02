import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import styles from './index.less'
import { Col, Row, DatePicker, Statistic, Card, Alert, Space } from 'antd'
import * as echarts from 'echarts'
import {
  getSummaryCount,
  getTop5Api,
  getTop5Duration,
  requestSummary,
} from '@/pages/DataService/ServiceDashboard/service'
import moment from 'moment'
import type { Moment } from 'moment'

type RangeValue = [Moment, Moment]

const RangePicker: any = DatePicker.RangePicker
const defaultSummary = {
  onlineNum: 0,
  offlineNum: 0,
  successNum: 0,
  failNum: 0,
  beginDate: '',
  endDate: '',
}
export default () => {
  const [dateRange, setDateRange] = useState<RangeValue>([moment().subtract(6, 'day'), moment()])
  const [apiVisits, setApiVisits] = useState<any>({ x: [], success: [], fail: [] })
  const [top5Api, setTop5Api] = useState<any>({ x: [], y: [] })
  const [top5Duration, setTop5Duration] = useState<any>({ x: [], y: [] })
  const [summary, setSummary] = useState<any>(defaultSummary)

  const ApiVisitsChart = (props) => {
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
            name: '成功',
            data: chartData.success,
            type: 'line',
            itemStyle: {
              color: 'rgb(11, 130, 53)',
            },
          },
          {
            name: '失败',
            data: chartData.fail,
            type: 'line',
            itemStyle: {
              color: 'rgb(255, 77, 79)',
            },
          },
        ],
      }
      tempChart.setOption(options)
    }

    useEffect(() => {
      initChart()
    }, [chartData])

    return <div style={{ width: '100%', height: 380 }} ref={chartsRef}></div>
  }
  const RankBarChart = (props) => {
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
          },
        ],
      }
      tempChart.setOption(options)
    }

    useEffect(() => {
      initChart()
    }, [chartData])

    return <div style={{ width: '100%', height: 380 }} ref={chartsRef}></div>
  }

  const initChartsData = ([beginDate, endDate]) => {
    const params = {
      beginDate: beginDate.format('YYYY-MM-DD'),
      endDate: endDate.add(1, 'day').format('YYYY-MM-DD'),
    }

    Promise.all([
      getSummaryCount(params),
      getTop5Api(params),
      getTop5Duration(params),
      requestSummary(),
    ]).then(([apiVisitsRes, top5ApiRes, top5DurationRes, summaryRes]) => {
      console.log(apiVisitsRes, top5ApiRes, top5DurationRes, summaryRes)
      setApiVisits(apiVisitsRes)
      setTop5Api(top5ApiRes)
      setTop5Duration(top5DurationRes)
      setSummary(summaryRes.datas || defaultSummary)
    })
  }
  useEffect(() => {
    initChartsData(dateRange)
  }, [])
  return (
    <>
      <RangePicker
        allowClear={false}
        value={dateRange}
        onChange={(date) => {
          setDateRange(date)
        }}
        onOpenChange={(bool) => {
          !bool && initChartsData(dateRange)
        }}
      />
      <Row style={{ marginTop: 10 }}>
        <Col span={18}>
          <div className={styles['title']}>Api访问量</div>
          {useMemo(() => {
            return <ApiVisitsChart chartData={apiVisits}></ApiVisitsChart>
          }, [apiVisits])}
        </Col>
        <Col offset={1} span={5}>
          <div className={styles['title']}>汇总信息</div>
          <div className={styles['summary-card']}>
            <div className="summary-top">
              <div className="statistic-box">
                <div className="statistic-value">{summary.onlineNum}</div>
                <div className="statistic-text">已发布</div>
              </div>
              <div className="divider-line"></div>
              <div className="statistic-box">
                <div className="statistic-value">{summary.offlineNum}</div>
                <div className="statistic-text">开发中</div>
              </div>
            </div>
            <div className="summary-data">
              <div className="all-calls">
                <span className="title">{`${moment(summary.beginDate).format('MM.DD')} ~ ${moment(
                  summary.endDate,
                ).format('MM.DD')} 总调用`}</span>
                <span className="value">{summary.successNum + summary.failNum}</span>
              </div>
              <Row>
                <Col span={12}>
                  <Statistic
                    title="成功"
                    valueStyle={{ color: '#3f8600' }}
                    value={summary.successNum}
                  ></Statistic>
                </Col>
                <Col span={12}>
                  <Statistic
                    title="失败"
                    valueStyle={{ color: '#cf1322' }}
                    value={summary.failNum}
                  ></Statistic>
                </Col>
              </Row>
            </div>
          </div>
        </Col>
      </Row>
      <Row style={{ marginTop: 10 }}>
        <Col span={11}>
          <div className={styles['title']}>成功调用次数</div>

          {useMemo(() => {
            return <RankBarChart chartData={top5Api}></RankBarChart>
          }, [top5Api])}
        </Col>

        <Col offset={2} span={11}>
          <div className={styles['title']}>平均访问时长(ms)</div>

          {useMemo(() => {
            return <RankBarChart chartData={top5Duration}></RankBarChart>
          }, [top5Duration])}
        </Col>
      </Row>
    </>
  )
}
