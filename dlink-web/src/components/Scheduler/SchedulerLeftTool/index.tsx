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


import {Tabs} from "antd";
import {AppstoreOutlined, BarsOutlined, InsertRowAboveOutlined, MessageOutlined} from "@ant-design/icons";
import {StateType} from "@/pages/Scheduler/model";
import {connect} from "umi";
import SchedulerTree from "../SchedulerTree";
import {l} from "@/utils/intl";

const {TabPane} = Tabs;

const SchedulerLeftTool = (props: any) => {

  const {toolHeight} = props;

  return (
    <Tabs defaultActiveKey="1" size="small" tabPosition="left" style={{height: toolHeight}}>
      <TabPane tab={<span><BarsOutlined/> {l('pages.scheduler.workflow.develop')}</span>} key="SchedulerTree">
        <SchedulerTree/>
      </TabPane>
    </Tabs>
  );
};

export default connect(({Scheduler}: { Scheduler: StateType }) => ({
  sql: Scheduler.sql,
  toolHeight: Scheduler.toolHeight,
}))(SchedulerLeftTool);
