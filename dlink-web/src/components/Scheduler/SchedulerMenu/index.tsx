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


import styles from "./index.less";
import {Col, Modal, Row, Tooltip} from "antd";
import {
  ClusterOutlined,
  CodeTwoTone,
  EnvironmentOutlined,
  MessageOutlined,
  ShrinkOutlined
} from "@ant-design/icons";
import Divider from "antd/es/divider";
import Button from "antd/es/button/button";
import Breadcrumb from "antd/es/breadcrumb/Breadcrumb";
import {StateType} from "@/pages/Scheduler/model";
import {connect} from "umi";
import {useCallback, useEffect} from "react";
import {Dispatch} from "@@/plugin-dva/connect";
import SchedulerTabs from "@/components/Scheduler/SchedulerTabs";
import {l} from "@/utils/intl";


const SchedulerMenu = (props: any) => {

  const {isFullScreen, current, currentPath, width, height, currentSession} = props;

  const onKeyDown = useCallback((e) => {
    if (e.keyCode === 83 && (e.ctrlKey === true || e.metaKey)) {
      e.preventDefault();
      if (current) {
        props.saveTask(current);
      }
    }
    if (e.keyCode === 113) {
      e.preventDefault();
      if (current) {
        // handleEditModalVisible(true);
        props.changeFullScreen(true);
      }
    }
  }, [current]);

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("keydown", onKeyDown)
    };
  }, [current]);

  const toFullScreen = () => {
    if (current) {
      props.changeFullScreen(true);
    }
  };

  const getPathItem = (paths) => {
    let itemList = [];
    for (let item of paths) {
      itemList.push(<Breadcrumb.Item key={item}>{item}</Breadcrumb.Item>)
    }
    return itemList;
  };

  return (
    <Row className={styles.container}>
      <Divider className={styles["ant-divider-horizontal-0"]}/>
      <Col span={24}>
        <Row>
          <Col span={12}>
            <Breadcrumb className={styles["dw-path"]}>
              <EnvironmentOutlined style={{lineHeight: '32px'}}/>
              <Divider type="vertical" style={{height: 'unset'}}/>
              {getPathItem(currentPath)}
            </Breadcrumb>
            {currentSession.session &&
              (
                <Breadcrumb className={styles["dw-path"]}>
                  <Divider type="vertical"/>
                  <MessageOutlined/>
                  <Divider type="vertical"/>
                  {currentSession.session}
                  <Divider type="vertical"/>
                  <ClusterOutlined/>
                </Breadcrumb>
              )}
          </Col>
        </Row>
      </Col>

      {current && isFullScreen ? <Modal
        width={width}
        bodyStyle={{padding: 0}}
        style={{top: 0, padding: 0, margin: 0, maxWidth: '100vw'}}
        destroyOnClose
        maskClosable={false}
        closable={true}
        closeIcon={
          <Tooltip title={l('pages.scheduler.editor.fullScreen.exit')}>
            <Button
              icon={<ShrinkOutlined/>}
              type="primary"
              style={{position: "fixed", right: "0"}}>
              {l('button.exit')}
            </Button>
          </Tooltip>}
        visible={isFullScreen}
        footer={null}
        onCancel={() => {
          props.changeFullScreen(false);
        }}>
        <SchedulerTabs width={width} height={height}/>
      </Modal> : undefined}
    </Row>
  );
};


const mapDispatchToProps = (dispatch: Dispatch) => ({
  changeFullScreen: (isFull: boolean) => dispatch({
    type: "Scheduler/changeFullScreen",
    payload: isFull,
  })
});

export default connect(({Scheduler}: { Scheduler: StateType }) => ({
  isFullScreen: Scheduler.isFullScreen,
  current: Scheduler.current,
  currentPath: Scheduler.currentPath,
  tabs: Scheduler.tabs,
  refs: Scheduler.refs,
  currentSession: Scheduler.currentSession,
}), mapDispatchToProps)(SchedulerMenu);
