import { Col, Divider, Row } from 'antd'
import { useEffect, useRef, useState } from 'react'
import * as echarts from 'echarts'
import type { EChartsType } from 'echarts'
import style from '../index.less'
import { getMetaDataStatistic, getTaskInstanceStatistic } from '../service'

interface IMetaData {
  id: number
  datasourceName: string
  datasourceId: number
  datasourceType: string
  dbNum: number
  tableNum: number
  dataVol: number
  name: string
  type: string
  dataUnit: string
}

export default () => {
  const leftDom = useRef<HTMLDivElement>(null)
  const leftIns = useRef<EChartsType | null>(null)
  const rightDom = useRef<HTMLDivElement>(null)
  const rightIns = useRef<EChartsType | null>(null)

  const initEchart = () => {
    const left = echarts.init(leftDom.current as HTMLElement)
    left.setOption({
      title: {
        text: '元数据TOP5',
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter([{ seriesName, name, data, value }]) {
          return [
            `元数据  ${data.dbNum + data.tableNum}`,
            `数据连接  ${data.datasourceName}`,
            `数据库  ${data.dbNum}`,
            `数据表  ${data.tableNum}`,
          ].join('</br>')
        },
      },
      legend: {
        show: false,
      },
      grid: {
        top: '12%',
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        show: false,
      },
      yAxis: {
        type: 'category',
        inverse: true,
        splitLine: {
          show: false,
        },
        data: [],
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          show: false,
        },
      },
      series: [
        {
          name: '元数据',
          type: 'bar',
          realtimeSort: true,
          label: {
            show: true,
            formatter: '{b}',
            position: 'left',
            align: 'left',
            offset: [10, -20],
          },
          barWidth: 20,
          data: [],
        },
      ],
    })

    leftIns.current = left

    const right = echarts.init(rightDom.current as HTMLElement)
    right.setOption({
      title: {
        text: '任务实例状态',
      },
      tooltip: {
        trigger: 'item',
      },
      grid: {
        top: '15%',
        containLabel: true,
      },
      legend: {
        orient: 'horizontal',
      },
      series: [
        {
          name: '任务实例状态',
          type: 'pie',
          radius: '50%',
          data: [],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    })

    rightIns.current = right
  }

  const queryData = () => {
    getMetaDataStatistic().then(({ code, datas }) => {
      if (code == 0) {
        leftIns.current?.setOption({
          yAxis: {
            data: datas.map((i) => i.datasourceName),
          },
          series: [
            {
              data: datas.map((i) => ({ ...i, value: i.dbNum + i.tableNum })),
            },
          ],
        })
      }
    })
    getTaskInstanceStatistic().then(({ code, datas }) => {
      if (code == 0) {
        rightIns.current?.setOption({
          series: [
            {
              data: datas.map((i) => ({ name: i.status, value: i.num })),
            },
          ],
        })
      }
    })
  }

  useEffect(() => {
    console.log('mount')
    initEchart()

    queryData()

    return () => {
      console.log('unmount')
    }
  }, [])
  return (
    <Row>
      <Col span="11">
        <div ref={leftDom} className={style['chart-container']} />
      </Col>
      <Col span="1">
        <Divider type="vertical" dashed style={{ height: '100%' }} />
      </Col>
      <Col span="12">
        <div ref={rightDom} className={style['chart-container']} />
      </Col>
    </Row>
  )
}
