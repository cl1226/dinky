import type { RadioChangeEvent } from 'antd'
import { Col, Divider, Row, Radio } from 'antd'
import { useEffect, useState, useRef } from 'react'
import { getOldStatistic } from '../service'

import style from '../index.less'
import moment from 'moment'
import * as echarts from 'echarts'
import type { EChartsType } from 'echarts'

export default () => {
  const [tabType, settabType] = useState<number>(7)
  const chartDom = useRef<HTMLDivElement | null>(null)
  const chartIns = useRef<EChartsType | null>(null)
  const options = [
    { label: '最近7天', value: 7 },
    { label: '最近15天', value: 15 },
    { label: '最近30天', value: 30 },
  ]

  const onChange = ({ target: { value } }: RadioChangeEvent) => {
    settabType(value)
  }

  const initEchart = () => {
    const ins = echarts.init(chartDom.current as HTMLDivElement)
    ins.setOption({
      color: ['#7B93E4'],
      legend: {},
      grid: {
        left: '10',
        right: '10',
        bottom: '10',
        top: '40',
        containLabel: true,
      },
      tooltip: {
        trigger: 'axis',
      },
      xAxis: {
        type: 'category',
        data: [],
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: '元数据',
          data: [],
          barMaxWidth: 30,
          type: 'bar',
        },
      ],
    })
    chartIns.current = ins
  }

  useEffect(() => {
    console.log('mount')
    initEchart()
    return () => {
      console.log('unmount')
    }
  }, [])

  useEffect(() => {
    console.log('ajax', tabType)
    const curMoment = moment()
    const endDate: string = curMoment.format('YYYY-MM-DD')
    const beginDate: string = curMoment.subtract(tabType, 'd').format('YYYY-MM-DD')

    // TODO change
    getOldStatistic({ beginDate, endDate }).then(({ datas, code }) => {
      if (code != 0) {
        return
      }
      const x: string[] = []
      const seriesData: string[] = []
      datas.forEach((item) => {
        x.push(item.date)
        seriesData.push(item.successNum)
      })
      chartIns.current?.setOption({
        xAxis: {
          data: x,
        },
        series: [
          {
            data: seriesData,
          },
        ],
      })
    })
  }, [tabType])

  return (
    <div className={style['chart-container']}>
      <div className={style.chart} ref={chartDom} />
      <div className={style['right-tools']}>
        <Radio.Group
          options={options}
          onChange={onChange}
          value={tabType}
          optionType="button"
          buttonStyle="solid"
        />
      </div>
    </div>
  )
}
