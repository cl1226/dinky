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

import React, { useCallback, useEffect, useState } from 'react'
import { connect } from 'umi'
import styles from './index.less'
import SchedulerMenu from './SchedulerMenu'
import { Card, Col, Form, Row } from 'antd'
import SchedulerTabs from './SchedulerTabs'
import { StateType } from '@/pages/Scheduler/model'
import SchedulerLeftTool from './SchedulerLeftTool'
import {
  getFillAllByVersion,
  listSession,
  showAlertGroup,
  showAlertInstance,
  showCluster,
  showClusterConfiguration,
  showDataBase,
  showEnv,
  showJars,
  showSessionCluster,
} from '@/components/Scheduler/SchedulerEvent/DDL'
import { loadSettings } from '@/pages/SettingCenter/FlinkSettings/function'

const Scheduler = (props: any) => {
  const { rightClickMenu, dispatch } = props

  const VIEW = {
    leftToolWidth: 300,
    marginTop: 84,
    topHeight: 35.6,
    bottomHeight: 127,
    rightMargin: 32,
    leftMargin: 36,
    midMargin: 46,
  }
  const [size, setSize] = useState({
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight,
  })
  const onResize = useCallback(() => {
    setSize({
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
    })
  }, [])

  useEffect(() => {
    window.addEventListener('resize', onResize)
    onResize()
    return () => {
      window.removeEventListener('resize', onResize)
    }
  }, [onResize])

  useEffect(() => {
    loadSettings(dispatch)
    getFillAllByVersion('', dispatch)
    showCluster(dispatch)
    showSessionCluster(dispatch)
    showClusterConfiguration(dispatch)
    showDataBase(dispatch)
    listSession(dispatch)
    showJars(dispatch)
    showAlertInstance(dispatch)
    showAlertGroup(dispatch)
    showEnv(dispatch)
    onResize()
  }, [])

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
    <div onClick={onClick} style={{ margin: '-24px', marginBottom: 0 }}>
      <SchedulerMenu />
      <Card bordered={false} className={styles.card}>
        <div className="guide-content">
          <Col className={styles['vertical-tabs']} style={{ width: VIEW.leftToolWidth }}>
            <SchedulerLeftTool />
          </Col>
          <Col style={{ width: `calc(100vw - ${VIEW.leftToolWidth}px)` }}>
            <SchedulerTabs />
          </Col>
        </div>
      </Card>
    </div>
  )
}

export default connect(({ Scheduler }: { Scheduler: StateType }) => ({
  rightClickMenu: Scheduler.rightClickMenu,
}))(Scheduler)
