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


import React, {useCallback, useEffect, useState} from "react";
import {connect} from "umi";
import styles from './index.less';
import SchedulerMenu from "./SchedulerMenu";
import {Card, Col, Form, Row} from "antd";
import SchedulerTabs from "./SchedulerTabs";
import {StateType} from "@/pages/Scheduler/model";
import SchedulerLeftTool from "./SchedulerLeftTool";
import SchedulerRightTool from "./SchedulerRightTool";
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
  showSessionCluster
} from "@/components/Scheduler/SchedulerEvent/DDL";
import DraggleLayout from "@/components/DraggleLayout";
import DraggleVerticalLayout from "@/components/DraggleLayout/DraggleVerticalLayout";
import {loadSettings} from "@/pages/SettingCenter/FlinkSettings/function";
import {l} from "@/utils/intl";

const Scheduler = (props: any) => {

  const {isFullScreen, rightClickMenu, toolHeight, toolLeftWidth, toolRightWidth, dispatch} = props;
  const [form] = Form.useForm();
  const VIEW = {
    leftToolWidth: 300,
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

  useEffect(() => {
    window.addEventListener('resize', onResize);
    onResize();
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [onResize]);

  useEffect(() => {
    loadSettings(dispatch);
    getFillAllByVersion('', dispatch);
    showCluster(dispatch);
    showSessionCluster(dispatch);
    showClusterConfiguration(dispatch);
    showDataBase(dispatch);
    listSession(dispatch);
    showJars(dispatch);
    showAlertInstance(dispatch);
    showAlertGroup(dispatch);
    showEnv(dispatch);
    onResize();
  }, []);

  const onClick = () => {
    if (rightClickMenu) {
      dispatch && dispatch({
        type: "Scheduler/showRightClickMenu",
        payload: false,
      });
    }
  };

  return (
    <div onClick={onClick} style={{'margin': '-24px'}}>
      <SchedulerMenu form={form} width={size.width} height={size.height}/>
      <Card bordered={false} className={styles.card} size="small" id="Scheduler_card" style={{marginBottom: 0}}>
        <Row>
        <DraggleLayout
            containerWidth={size.width}
            containerHeight={size.height - VIEW.marginTop}
            min={VIEW.leftMargin}
            max={size.width - VIEW.rightMargin - VIEW.midMargin}
            initLeftWidth={toolLeftWidth}
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
              <SchedulerLeftTool style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}/>
            </Col>
            <Col>
              {!isFullScreen ? <SchedulerTabs width={size.width - toolRightWidth - toolLeftWidth}/> : undefined}
            </Col>
          </DraggleLayout>
        </Row>
      </Card>
    </div>
  )
};

export default connect(({Scheduler}: { Scheduler: StateType }) => ({
  isFullScreen: Scheduler.isFullScreen,
  rightClickMenu: Scheduler.rightClickMenu,
  toolHeight: Scheduler.toolHeight,
  toolLeftWidth: Scheduler.toolLeftWidth,
  toolRightWidth: Scheduler.toolRightWidth,
}))(Scheduler);
