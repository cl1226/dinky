import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import styles from './index.less'
import { Col, Row, DatePicker, Statistic, Card, Alert, Space } from 'antd'
import type { DatePickerProps } from 'antd'
import * as echarts from 'echarts'

const RangePicker: any = DatePicker.RangePicker

export default () => {
  const onChange: DatePickerProps['onChange'] = (date, dateString) => {
    console.log(date, dateString)
  }

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
            data: chartData.y,
            type: 'line',
            smooth: true,
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
  return (
    <>
      <RangePicker onChange={onChange} />
      <Row style={{ marginTop: 10 }}>
        <Col span={18}>
          <div className={styles['title']}>Api访问量</div>
          <ApiVisitsChart
            chartData={{
              x: ['12/30', '12/31', '1/1', '1/2', '1/3', '1/4', '1/5'],
              y: [820, 932, 901, 934, 1290, 1330, 1320],
            }}
          ></ApiVisitsChart>
        </Col>
        <Col offset={1} span={5}>
          <div className={styles['title']}>汇总信息</div>
          <div className={styles['summary-card']}>
            <div className="summary-top">
              <div className="statistic-box">
                <div className="statistic-value">58</div>
                <div className="statistic-text">已发布</div>
              </div>
              <div className="divider-line"></div>
              <div className="statistic-box">
                <div className="statistic-value">58</div>
                <div className="statistic-text">开发中</div>
              </div>
            </div>
            <div className="summary-data">
              <div className="all-calls">
                <span className="title">5.25 ~ 5.31 总调用</span>
                <span className="value">0</span>
              </div>
              <Row>
                <Col span={12}>
                  <Statistic
                    title="成功"
                    valueStyle={{ color: '#3f8600' }}
                    value={112893}
                  ></Statistic>
                </Col>
                <Col span={12}>
                  <Statistic
                    title="失败"
                    valueStyle={{ color: '#cf1322' }}
                    value={112893}
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
          <RankBarChart
            chartData={{
              x: ['1/1', '1/2', '1/3', '1/4', '1/5'],
              y: [901, 934, 1290, 1330, 1320],
            }}
          ></RankBarChart>
        </Col>

        <Col offset={2} span={11}>
          <div className={styles['title']}>平均访问时长</div>
          <RankBarChart
            chartData={{
              x: ['1/1', '1/2', '1/3', '1/4', '1/5'],
              y: [901, 934, 1290, 1330, 1320],
            }}
          ></RankBarChart>
        </Col>
      </Row>
    </>
  )
}
