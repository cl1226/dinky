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


import {useCallback, useEffect, useState} from "react";
import {connect} from "umi";
import styles from './index.less';
import StudioMenu from "./StudioMenu";
import {Card, Col, Form, Row, Tooltip } from "antd";
import StudioTabs from "./StudioTabs";
import {StateType} from "@/pages/DataStudio/model";
import StudioRightTool from "./StudioRightTool";
import StudioTree from "./StudioTree";
import StudioConsole from "./StudioConsole";

import {
  MinusOutlined,
  SwitcherOutlined
} from "@ant-design/icons";

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
} from "@/components/Studio/StudioEvent/DDL";
import DraggleLayout from "@/components/DraggleLayout";
import {loadSettings} from "@/pages/SettingCenter/FlinkSettings/function";

const Studio = (props: any) => {

  const {isFullScreen, rightClickMenu, toolHeight, toolLeftWidth, toolRightWidth, dispatch} = props;
  const [form] = Form.useForm();
  const VIEW = {
    leftToolWidth: 300,
    marginTop: 84,
    topHeight: 35.6,
    bottomHeight: 40,
    rightMargin: 32,
    leftMargin: 36,
    midMargin: 46,
  };
  
  const [bottomHeight, setBottomHeight] = useState(40)
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
        type: "Studio/showRightClickMenu",
        payload: false,
      });
    }
  };

  const backup = () => {
    setBottomHeight(300)
  }

  const min = () => {
    setBottomHeight(40)
  }

  const operations = 
  <>
    <Tooltip title="最小化"><MinusOutlined onClick={() => min()} style={{'cursor': 'pointer', 'margin-right': '15px'}}/></Tooltip>
    <Tooltip title="还原"><SwitcherOutlined onClick={() => backup()} tooltip="还原" style={{'cursor': 'pointer', 'margin-right': '15px'}}/></Tooltip>
  </>;

  return (
    <div onClick={onClick} style={{'margin': '-24px'}}>
      <StudioMenu form={form} width={size.width} height={size.height}/>
      <Card bordered={false} className={styles.card} size="small" id="studio_card" style={{marginBottom: 0}}>
        
        <Row>
          <DraggleLayout
            containerWidth={size.width - 240}
            containerHeight={size.height - 85}
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
            <Col className={styles["vertical-tabs"]} style={{'width': toolLeftWidth}}>
              <Row style={{'width': toolLeftWidth}}>
                <StudioTree width={toolLeftWidth}/>
              </Row>
            </Col>
            <Col>
              {/* <DraggleVerticalLayout
                containerWidth={size.width - toolLeftWidth - 250}
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
              > */}
                <Row style={{'height': size.height - VIEW.topHeight - bottomHeight - 50}}>
                  <Col span={24} style={{'height': '100%'}}>
                    {!isFullScreen ? <StudioTabs height={'100%'} width={size.width - toolLeftWidth}/> : undefined}
                  </Col>
                </Row>
                <Row style={{'height': bottomHeight}}>
                  <Col span={24}>
                    <StudioConsole height={bottomHeight} operations={operations}/>
                  </Col>
                </Row>
              {/* </DraggleVerticalLayout> */}
            </Col>
          </DraggleLayout>
          <Col id='StudioRightTool' className={styles["vertical-tabs"]}>
            <StudioRightTool form={form}/>
          </Col>
        </Row>
      </Card>
    </div>
  )
};

export default connect(({Studio}: { Studio: StateType }) => ({
  isFullScreen: Studio.isFullScreen,
  rightClickMenu: Studio.rightClickMenu,
  toolHeight: Studio.toolHeight,
  toolLeftWidth: Studio.toolLeftWidth,
  toolRightWidth: Studio.toolRightWidth,
}))(Studio);
