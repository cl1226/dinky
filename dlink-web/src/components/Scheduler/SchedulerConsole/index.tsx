
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


import {Empty, Tabs} from "antd";
import {
  ApartmentOutlined,
  BarChartOutlined,
  CalendarOutlined,
  CodeOutlined,
  DesktopOutlined,
  TableOutlined
} from "@ant-design/icons";
import {StateType} from "@/pages/Scheduler/model";
import {connect} from "umi";
import SchedulerMsg from "./SchedulerMsg";
import SchedulerTable from "./SchedulerTable";
import SchedulerHistory from "./SchedulerHistory";
import SchedulerCA from "./SchedulerCA";
import SchedulerProcess from "./SchedulerProcess";
import {Scrollbars} from 'react-custom-scrollbars';
import Chart from "@/components/Chart";
import {useState} from "react";
import {l} from "@/utils/intl";

const {TabPane} = Tabs;

const SchedulerConsole = (props: any) => {



  const {height, current} = props;
  let consoleHeight = (height - 37.6);
  const [activeKey, setActiveKey] = useState<string>("SchedulerMsg");

  const onTabsChange = (key: string) => {
    setActiveKey(key);
  }

  return (
    <Tabs defaultActiveKey="SchedulerMsg" size="small" tabPosition="top" style={{
      border: "1px solid #f0f0f0", height: height, margin: "0 32px"
    }} onChange={onTabsChange}>
      <TabPane
        tab={
          <span>
          <CodeOutlined/>
            {l('pages.Scheduler.label.info')}
        </span>
        }
        key="SchedulerMsg"
      >
        <Scrollbars style={{height: consoleHeight}}>
          <SchedulerMsg height={consoleHeight} isActive={activeKey === "SchedulerMsg"}/>
        </Scrollbars>
      </TabPane>
      <TabPane
        tab={
          <span>
          <TableOutlined/>
            {l('pages.Scheduler.label.result')}
        </span>
        }
        key="SchedulerTable"
      >
        <Scrollbars style={{height: consoleHeight}}>
          {current ? <SchedulerTable/> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}/>}
        </Scrollbars>
      </TabPane>
      <TabPane
        tab={
          <span>
          <BarChartOutlined/>
          BI
        </span>
        }
        key="SchedulerChart"
      >
        <Scrollbars style={{height: consoleHeight}}>
          {current ? <Chart height={consoleHeight}/> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}/>}
        </Scrollbars>
      </TabPane>
      <TabPane
        tab={
          <span>
          <ApartmentOutlined/>
            {l('pages.Scheduler.label.lineage')}
        </span>
        }
        key="SchedulerConsanguinity"
      >
        <Scrollbars style={{height: consoleHeight}}>
          {current ? <SchedulerCA/> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}/>}
        </Scrollbars>
      </TabPane>
      <TabPane
        tab={
          <span>
          <DesktopOutlined/>
            {l('pages.Scheduler.label.process')}
        </span>
        }
        key="SchedulerProcess"
      >
        <Scrollbars style={{height: consoleHeight}}>
          <SchedulerProcess/>
        </Scrollbars>
      </TabPane>
      <TabPane
        tab={
          <span>
          <CalendarOutlined/>
            {l('pages.Scheduler.label.history')}
        </span>
        }
        key="SchedulerHistory"
      >
        <Scrollbars style={{height: consoleHeight}}>
          <SchedulerHistory/>
        </Scrollbars>
      </TabPane>
      {/*<TabPane*/}
      {/*  tab={*/}
      {/*    <span>*/}
      {/*    <FunctionOutlined/>*/}
      {/*      {l('pages.Scheduler.label.function')}*/}
      {/*  </span>*/}
      {/*  }*/}
      {/*  key="SchedulerFX"*/}
      {/*>*/}
      {/*  <Scrollbars style={{height: consoleHeight}}>*/}
      {/*    <SchedulerFX/>*/}
      {/*  </Scrollbars>*/}
      {/*</TabPane>*/}
    </Tabs>
  );
};

export default connect(({Scheduler}: { Scheduler: StateType }) => ({
  sql: Scheduler.sql,
  current: Scheduler.current,
}))(SchedulerConsole);
