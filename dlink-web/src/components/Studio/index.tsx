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
import {Card, Col, Form, Row, Drawer, Tabs} from "antd";
import StudioTabs from "./StudioTabs";
import {StateType} from "@/pages/DataStudio/model";
import StudioConsole from "./StudioConsole";
import StudioRightTool from "./StudioRightTool";
import StudioTree from "./StudioTree";
import {BarsOutlined} from "@ant-design/icons";

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
import DraggleVerticalLayout from "@/components/DraggleLayout/DraggleVerticalLayout";
import {loadSettings} from "@/pages/SettingCenter/FlinkSettings/function";
import {l} from "@/utils/intl";

const Studio = (props: any) => {

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
        type: "Studio/showRightClickMenu",
        payload: false,
      });
    }
  };

  const [open, setOpen] = useState(true);

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

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
            <Col className={styles["vertical-tabs"]}>
              <StudioTree/>
            </Col>
            <Col>
              {!isFullScreen ? <StudioTabs width={size.width - toolLeftWidth}/> : undefined}
            </Col>
          </DraggleLayout>
          <Col id='StudioRightTool' className={styles["vertical-tabs"]}>
              <StudioRightTool form={form}/>
            </Col>
        </Row>

        {/* <DraggleVerticalLayout
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
            <Col span={24}>
              <StudioConsole height={size.height - toolHeight - VIEW.marginTop}/>
            </Col>
          </Row>
        </DraggleVerticalLayout> */}
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
