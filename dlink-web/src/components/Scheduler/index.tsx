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

import { connect } from 'umi'
import styles from './index.less'
import { Card, Col } from 'antd'
import { StateType } from '@/pages/Scheduler/model'
import SchedulerTabs from './SchedulerTabs'
import SchedulerMenu from './SchedulerMenu'
import SchedulerLeftTool from './SchedulerLeftTool'

const Scheduler = (props: any) => {
  const { rightClickMenu, dispatch } = props

  const VIEW = {
    leftToolWidth: 300,
  }

  const onClick = () => {
    if (rightClickMenu) {
      dispatch &&
        dispatch({
          type: 'Scheduler/showRightClickMenu',
          payload: false,
        })
    }
  }

  return (
    <div onClick={onClick} style={{ margin: '-24px', marginBottom: 0, overflow: 'hidden' }}>
      <SchedulerMenu />
      <div className={styles.card}>
        <div className="guide-content">
          <Col className={styles['vertical-tabs']} style={{ width: VIEW.leftToolWidth }}>
            <SchedulerLeftTool />
          </Col>
          <Col style={{ width: `calc(100vw - ${VIEW.leftToolWidth}px)` }}>
            <SchedulerTabs />
          </Col>
        </div>
      </div>
    </div>
  )
}

export default connect(({ Scheduler }: { Scheduler: StateType }) => ({
  rightClickMenu: Scheduler.rightClickMenu,
}))(Scheduler)
