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
import {useCallback, useEffect, useState} from "react";
import styles from './index.less'
import {  Col, Row, Card } from 'antd'
import { StateType } from '@/pages/Scheduler/model'
import SchedulerTabs from './SchedulerTabs'
import SchedulerMenu from './SchedulerMenu'
import SchedulerLeftTool from './SchedulerLeftTool'
import DraggleLayout from "@/components/DraggleLayout";

const Scheduler = (props: any) => {
  const { rightClickMenu, dispatch } = props

  const VIEW = {
    leftToolWidth: 200,
    marginTop: 84,
    topHeight: 35.6,
    bottomHeight: 127,
    rightMargin: 32,
    leftMargin: 36,
    midMargin: 46,
  };

  const [size, setSize] = useState({
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight,
  });
  const onResize = useCallback(() => {
    setSize({
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
    })
  }, []);

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
    <div onClick={onClick} style={{ margin: '-24px', overflow: 'hidden' }}>
      <SchedulerMenu />
      <div className={styles.card}>
        <Row>
          <DraggleLayout
              containerWidth={size.width - VIEW.leftToolWidth}
              containerHeight={size.height - 85}
              min={VIEW.leftMargin}
              max={size.width - VIEW.rightMargin - VIEW.midMargin}
              initLeftWidth={250}
              isLeft={true}
              handler={
                <div
                  style={{
                    width: 4,
                    height: '100%',
                    background: 'rgb(240, 240, 240)',
                  }}
                />
              }
            >
              <Col className={styles["vertical-tabs"]}>
                <SchedulerLeftTool/>
              </Col>
              <Col style={{ width: `calc(100vw - ${VIEW.leftToolWidth}px)` }}>
                <SchedulerTabs />
              </Col>
            </DraggleLayout>
        </Row>
      </div>
    </div>
  )
}

export default connect(({ Scheduler }: { Scheduler: StateType }) => ({
  rightClickMenu: Scheduler.rightClickMenu,
}))(Scheduler)
