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

import React, {Key, useEffect, useState} from "react";
import {Tabs} from "antd";
import {ContainerOutlined, ScheduleOutlined, SettingOutlined} from "@ant-design/icons";
import {StateType} from "@/pages/Scheduler/model";
import {connect} from "umi";
import SchedulerGuide from "./SchedulerGuide";
import SchedulerTaskInfo from "./SchedulerTaskInfo";
import {l} from "@/utils/intl";

const {TabPane} = Tabs;

const SchedulerRightTool = (props: any) => {

  const {current, form, toolHeight} = props;

  const [size, setSize] = useState({
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight,
  });

  const renderTaskInfoContent = () => {
    return (
      <TabPane tab={<span><ContainerOutlined/> {l('pages.scheduler.label.jobInfo')}</span>} key="SchedulerTaskInfo">
        <SchedulerTaskInfo form={form}/>
      </TabPane>
    )
  };

  return (
    <>
      {current?.task ?
        <Tabs defaultActiveKey="1" size="small" tabPosition="right" style={{height: toolHeight}}>
          {renderTaskInfoContent()}
        </Tabs> : <SchedulerGuide toolHeight={size.height - 156}/>}
    </>
  );
};

export default connect(({Scheduler}: { Scheduler: StateType }) => ({
  sql: Scheduler.sql,
  toolHeight: Scheduler.toolHeight,
  current: Scheduler.current,
}))(SchedulerRightTool);
