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


import React, {useEffect, useImperativeHandle, useRef, useState, useCallback } from 'react';
import * as _monaco from "monaco-editor";
import style from "./index.less";
import { Col, Divider, Row } from 'antd';
import {connect, Dispatch} from "umi";
import {DocumentStateType} from "@/pages/RegistrationCenter/Document/model";
import {XFlowEditor} from "@/components/XFlow"

export interface IProps {
  meta: { flowId: string }
}

const WorkflowEditor = (props:any) => {

  return (
    <XFlowEditor></XFlowEditor>
  )
}

const mapDispatchToProps = (dispatch:Dispatch)=>({
  /*saveText:(tabs:any,tabIndex:any)=>dispatch({
    type: "Scheduler/saveTask",
    payload: tabs.panes[tabIndex].task,
  }),*/
  saveSql:(val: any)=>dispatch({
    type: "Scheduler/saveSql",
    payload: val,
  }),saveSqlMetaData:(sqlMetaData: any,key: number)=>dispatch({
    type: "Scheduler/saveSqlMetaData",
    payload: {
      activeKey:key,
      sqlMetaData,
      isModified: true,
    }
  }),
})

export default WorkflowEditor;
