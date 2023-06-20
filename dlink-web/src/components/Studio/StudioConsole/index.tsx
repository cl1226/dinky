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

import { Empty, Tabs, Tooltip } from 'antd'
import {
  ApartmentOutlined,
  BarChartOutlined,
  CalendarOutlined,
  CodeOutlined,
  DesktopOutlined,
  TableOutlined,
  UpSquareOutlined,
  DownSquareOutlined,
} from '@ant-design/icons'
import { Dispatch } from '@@/plugin-dva/connect'
import { StateType } from '@/pages/DataStudio/model'
import { connect } from 'umi'
import StudioMsg from './StudioMsg'
import StudioTable from './StudioTable'
import StudioHistory from './StudioHistory'
import StudioCA from './StudioCA'
import StudioProcess from './StudioProcess'
import { Scrollbars } from 'react-custom-scrollbars'
import Chart from '@/components/Chart'
import { useState } from 'react'
import { l } from '@/utils/intl'
import styles from './index.less'
const { TabPane } = Tabs

const StudioConsole = (props: any) => {
  const { height, current, toolHeight } = props
  let consoleHeight = height - 36
  const [activeKey, setActiveKey] = useState<string>('StudioMsg')

  const onTabsChange = (key: string) => {
    setActiveKey(key)
  }

  return (
    <>
      {current?.task ? (
        <Tabs
          defaultActiveKey="StudioMsg"
          size="small"
          tabPosition="top"
          tabBarExtraContent={
            <>
              <Tooltip title="最小化">
                <DownSquareOutlined
                  onClick={() => props.saveToolHeight(32)}
                  style={{ cursor: 'pointer', marginRight: '15px' }}
                />
              </Tooltip>
              <Tooltip title="还原">
                <UpSquareOutlined
                  onClick={() => props.saveToolHeight(400)}
                  style={{ cursor: 'pointer', marginRight: '15px' }}
                />
              </Tooltip>
            </>
          }
          style={{
            borderTop: '1px solid #f0f0f0',
            borderRight: '1px solid #f0f0f0',
            height: toolHeight,
            paddingLeft: '5px',
            backgroundColor: '#fff',
          }}
          onChange={onTabsChange}
          onTabClick={() => props.saveToolHeight(400)}
        >
          <TabPane
            tab={
              <span>
                <CodeOutlined />
                {l('pages.datastudio.label.info')}
              </span>
            }
            key="StudioMsg"
            className={styles['msg-tab']}
          >
            <Scrollbars style={{ height: consoleHeight }}>
              <StudioMsg height={consoleHeight} isActive={activeKey === 'StudioMsg'} />
            </Scrollbars>
          </TabPane>
          <TabPane
            tab={
              <span>
                <TableOutlined />
                {l('pages.datastudio.label.result')}
              </span>
            }
            key="StudioTable"
          >
            <Scrollbars style={{ height: consoleHeight }}>
              {current ? <StudioTable /> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
            </Scrollbars>
          </TabPane>
          <TabPane
            tab={
              <span>
                <BarChartOutlined />
                BI
              </span>
            }
            key="StudioChart"
          >
            <Scrollbars style={{ height: consoleHeight }}>
              {current ? (
                <Chart height={consoleHeight} />
              ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </Scrollbars>
          </TabPane>
          <TabPane
            tab={
              <span>
                <ApartmentOutlined />
                {l('pages.datastudio.label.lineage')}
              </span>
            }
            key="StudioConsanguinity"
          >
            <Scrollbars style={{ height: consoleHeight }}>
              {current ? <StudioCA /> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
            </Scrollbars>
          </TabPane>
          <TabPane
            tab={
              <span>
                <DesktopOutlined />
                {l('pages.datastudio.label.process')}
              </span>
            }
            key="StudioProcess"
          >
            <Scrollbars style={{ height: consoleHeight }}>
              <StudioProcess />
            </Scrollbars>
          </TabPane>
          <TabPane
            tab={
              <span>
                <CalendarOutlined />
                {l('pages.datastudio.label.history')}
              </span>
            }
            key="StudioHistory"
          >
            <Scrollbars style={{ height: consoleHeight }}>
              <StudioHistory />
            </Scrollbars>
          </TabPane>
        </Tabs>
      ) : (
        ''
      )}
    </>
  )
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  saveToolHeight: (toolHeight: number) =>
    dispatch({
      type: 'Studio/saveToolHeight',
      payload: toolHeight,
    }),
})

export default connect(
  ({ Studio }: { Studio: StateType }) => ({
    sql: Studio.sql,
    current: Studio.current,
    toolHeight: Studio.toolHeight,
  }),
  mapDispatchToProps,
)(StudioConsole)
