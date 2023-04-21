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


import {Typography} from 'antd';
import React from 'react';
import {StateType} from '@/pages/Scheduler/model';
import {Scrollbars} from 'react-custom-scrollbars';
import {connect, history} from 'umi';
import {l} from "@/utils/intl";

const {Title, Paragraph, Link, Text} = Typography;

const SchedulerGuide = (props: any) => {

  const {toolHeight} = props;

  return (
    <Scrollbars style={{height: toolHeight}}>
      <Typography style={{padding: '15px'}}>
        <Title level={5}>{l('pages.Scheduler.label.quickguide')}</Title>
        <Paragraph>
          <ul>
            <li>
              <Link onClick={() => {
                history.push('/registration/cluster/clusterInstance')
              }}>{l('pages.Scheduler.label.registcluster')}</Link>
            </li>
            <li>
              <Link onClick={() => {
                history.push('/registration/cluster/clusterConfiguration')
              }}>{l('pages.Scheduler.label.registclusterconfig')}</Link>
            </li>
            <li>
              <Link onClick={() => {
                history.push('/registration/jar')
              }}>{l('pages.Scheduler.label.registjar')}</Link>
            </li>
            <li>
              <Link onClick={() => {
                history.push('/registration/database')
              }}>{l('pages.Scheduler.label.registdatasource')}</Link>
            </li>
            <li>
              <Link onClick={() => {
                history.push('/datacenter/metadata')
              }}>{l('pages.Scheduler.label.metadata')}</Link>
            </li>
            <li>
              <Link onClick={() => {
                history.push('/registration/alert/alertInstance')
              }}>{l('pages.Scheduler.label.alarmInstance')}</Link>
            </li>
            <li>
              <Link onClick={() => {
                history.push('/registration/alert/alertGroup')
              }}>{l('pages.Scheduler.label.alarmGroup')}</Link>
            </li>
            <li>
              <Link onClick={() => {
                history.push('/registration/fragment')
              }}>{l('pages.Scheduler.label.val')}</Link>
            </li>
            <li>
              <Link onClick={() => {
                history.push('/registration/document')
              }}>{l('pages.Scheduler.label.registdocument')}</Link>
            </li>
            <li>
              <Link onClick={() => {
                history.push('/settingCenter/flinkSettings')
              }}>{l('pages.Scheduler.label.configsystemconfig')}</Link>
            </li>
            <li>
              <Link onClick={() => {
                history.push('/settingCenter/udfTemplate')
              }}>{l('pages.Scheduler.label.udfTemplate')}</Link>
            </li>
            <li>
              <Link onClick={() => {
                history.push('/settingCenter/systemInfo')
              }}>{l('pages.Scheduler.label.systemInfo')}</Link>
            </li>
            <li>
              <Link href="http://www.dlink.top/"
                    target="_blank">{l('pages.Scheduler.label.officialdocumentation')}</Link>
            </li>
            <li>
              <Link href="https://github.com/DataLinkDC/dlink" target="_blank">Github</Link>
            </li>
          </ul>
        </Paragraph>
      </Typography>
    </Scrollbars>
  );
};

export default connect(({Scheduler}: { Scheduler: StateType }) => ({
  current: Scheduler.current,
  sql: Scheduler.sql,
  tabs: Scheduler.tabs,
  toolHeight: Scheduler.toolHeight,
}))(SchedulerGuide);
