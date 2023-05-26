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
import {ContainerOutlined, ScheduleOutlined, SettingOutlined, CodeOutlined} from "@ant-design/icons";
import {StateType} from "@/pages/DataStudio/model";
import {connect} from "umi";
import StudioConfig from "./StudioConfig";
import StudioSetting from "./StudioSetting";
import StudioSavePoint from "./StudioSavePoint";
import StudioHistory from "./StudioHistory";
import StudioEnvSetting from "./StudioEnvSetting";
import StudioSqlConfig from "./StudioSqlConfig";
import StudioUDFInfo from "./StudioUDFInfo";
import StudioJarSetting from "./StudioJarSetting";
import StudioGuide from "./StudioGuide";
import StudioTaskInfo from "./StudioTaskInfo";
import {DIALECT, isSql} from "@/components/Studio/conf";
import StudioKubernetesConfig from "@/components/Studio/StudioRightTool/StudioKubernetesConfig";
import './index.less'
import {l} from "@/utils/intl";
import { useState } from "react";
import { Scrollbars } from 'react-custom-scrollbars'
import StudioMsg from "../StudioConsole/StudioMsg"

const {TabPane} = Tabs;

const StudioRightTool = (props: any) => {

  const {current, form, toolHeight} = props;

  const [showTabPane, setshowTabPane] = useState(false)

  const renderContent = () => {
    if (isSql(current.task.dialect)) {
      return renderSqlContent();
    }
    if (DIALECT.FLINKJAR === current.task.dialect) {
      return renderJarContent();
    }
    if (DIALECT.FLINKSQLENV === current.task.dialect) {
      return renderEnvContent();
    }
    if (DIALECT.JAVA === current.task.dialect) {
      return renderUDFContent();
    }
    if (DIALECT.SCALA === current.task.dialect) {
      return renderUDFContent();
    }
    if (DIALECT.PYTHON === current.task.dialect) {
      return renderUDFContent();
    }
    if (DIALECT.KUBERNETES_APPLICATION === current.task.dialect) {
      return renderKubernetesContent();
    }
    return renderFlinkSqlContent();
  };

  const renderTaskInfoContent = () => {
    return (
      <TabPane tab={<span><ContainerOutlined/> {l('pages.datastudio.label.jobInfo')}</span>} key="StudioTaskInfo">
        <StudioTaskInfo form={form}/>
      </TabPane>
    )
  };

  // const renderConsoleMsg = () => {
  //   return (
  //     <TabPane
  //       tab={
  //         <span>
  //         <CodeOutlined/>
  //           {l('pages.datastudio.label.info')}
  //       </span>
  //       }
  //       key="StudioMsg"
  //     >
  //       <Scrollbars style={{height: '100%'}}>
  //         <StudioMsg height={'100%'}/>
  //       </Scrollbars>
  //     </TabPane>
  //   )
  // }

  const renderSqlContent = () => {
    return (<>
      <TabPane tab={<span><SettingOutlined/> {l('pages.datastudio.label.execConfig')}</span>} key="StudioSqlConfig">
        <StudioSqlConfig form={form}/>
      </TabPane>
    </>)
  };

  const renderKubernetesContent = () => {
    return (<>
      <TabPane tab={<span><SettingOutlined/> {l('pages.datastudio.label.execConfig')}</span>} key="StudioSqlConfig">
        <StudioKubernetesConfig form={form}/>
      </TabPane>
      <TabPane tab={<span><ScheduleOutlined/> {l('pages.datastudio.label.savepoint')}</span>} key="StudioSavePoint">
        <StudioSavePoint/>
      </TabPane>
    </>)
  };

  const renderJarContent = () => {
    return (<>
      <TabPane tab={<span><SettingOutlined/> {l('pages.datastudio.label.jobConfig')}</span>} key="StudioJarSetting">
        <StudioJarSetting form={form}/>
      </TabPane>
    </>)
  };

  const renderEnvContent = () => {
    return (<>
      <TabPane tab={<span><SettingOutlined/> {l('pages.datastudio.label.jobConfig')}</span>} key="StudioEnvSetting">
        <StudioEnvSetting form={form}/>
      </TabPane>
    </>)
  };

  const renderUDFContent = () => {
    return (<>
      <TabPane tab={<span><SettingOutlined/> {l('pages.datastudio.label.udfInfo')}</span>} key="StudioUDFInfo">
        <StudioUDFInfo form={form}/>
      </TabPane>
    </>)
  };

  const renderFlinkSqlContent = () => {
    return (<><TabPane tab={<span><SettingOutlined/> {l('pages.datastudio.label.jobConfig')}</span>} key="StudioSetting">
      <StudioSetting form={form}/>
    </TabPane>
      <TabPane tab={<span><SettingOutlined/> {l('pages.datastudio.label.execConfig')}</span>} key="StudioConfig">
        <StudioConfig form={form}/>
      </TabPane>
      <TabPane tab={<span><ScheduleOutlined/> {l('pages.datastudio.label.savepoint')}</span>} key="StudioSavePoint">
        <StudioSavePoint/>
      </TabPane>
      <TabPane tab={<span><ScheduleOutlined/> {l('pages.datastudio.label.version')}</span>} key="StudioHistory">
        <StudioHistory/>
      </TabPane>
    </>)
  };

  return (
    <>
      {current?.task ?
        <Tabs className={`righttools-tabcontent-wrap righttools-tabcontent-wrap${showTabPane && '-show'}`} onTabClick={() => setshowTabPane(!showTabPane)} defaultActiveKey="1" size="small" tabPosition="right" >
          {renderContent()}
          {renderTaskInfoContent()}
        </Tabs> : <StudioGuide toolHeight={toolHeight}/>}
    </>
  );
};

export default connect(({Studio}: { Studio: StateType }) => ({
  sql: Studio.sql,
  toolHeight: Studio.toolHeight,
  current: Studio.current,
}))(StudioRightTool);
