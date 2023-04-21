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
import {Card, Col, Form, Row} from "antd";
import {StateType} from "./model";
import DraggleLayout from "@/components/DraggleLayout";
import DraggleVerticalLayout from "@/components/DraggleLayout/DraggleVerticalLayout";
import {l} from "@/utils/intl";

const SchedulerStudio = (props: any) => {

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
    onResize();
  }, []);

  const onClick = () => {
    if (rightClickMenu) {
      dispatch && dispatch({
        type: "SchedulerStudio/showRightClickMenu",
        payload: false,
      });
    }
  };

  return (
    <div onClick={onClick} style={{'margin': '-24px'}}>
      <Card bordered={false} className={styles.card} size="small" id="schedulerstudio_card" style={{marginBottom: 0}}>
      	<DraggleVerticalLayout
          containerWidth={size.width}
          containerHeight={(size.height - VIEW.marginTop)}
          min={(VIEW.topHeight)}
          max={(size.height - VIEW.bottomHeight)}
          initTopHeight={VIEW.topHeight}
          handler={
            <div
              style={{
                height: 4,
                width: '100%',
                background: 'rgb(240, 240, 240)',
              }}
            />
          }
        >
          <Row>
            <DraggleLayout
              containerWidth={size.width}
              containerHeight={toolHeight}
              min={VIEW.leftMargin + VIEW.midMargin}
              max={size.width - VIEW.rightMargin}
              initLeftWidth={size.width - toolRightWidth}
              isLeft={false}
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
            	<Col id='StudioRightTool' className={styles["vertical-tabs"]}>
                <div form={form}/>
              </Col>
              <Col className={styles["vertical-tabs"]}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}/>
              </Col>
              
            </DraggleLayout>
          </Row>
          <Row>
            <Col span={24}>
              <div height={size.height - toolHeight - VIEW.marginTop}/>
            </Col>
          </Row>
        </DraggleVerticalLayout>
      </Card>
    </div>
  )
};

export default connect(({SchedulerStudio}: { SchedulerStudio: StateType }) => ({
  isFullScreen: SchedulerStudio.isFullScreen,
  rightClickMenu: SchedulerStudio.rightClickMenu,
  toolHeight: SchedulerStudio.toolHeight,
  toolLeftWidth: SchedulerStudio.toolLeftWidth,
  toolRightWidth: SchedulerStudio.toolRightWidth,
}))(SchedulerStudio);
