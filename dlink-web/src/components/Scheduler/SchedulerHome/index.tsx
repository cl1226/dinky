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

import {Divider, Typography} from 'antd';
import React from 'react';
import {connect} from 'umi';
import {StateType} from '@/pages/Scheduler/model';
import {Scrollbars} from 'react-custom-scrollbars';
import {VERSION} from "@/components/Common/Version";
import {l} from "@/utils/intl";

const {Title, Paragraph, Text} = Typography;

const SchedulerHome = (props: any) => {


  const {toolHeight} = props;

  return (
    <Scrollbars style={{height: toolHeight}}>
      <Typography style={{padding: '15px'}}>
        <Title level={4}>{l('pages.Scheduler.label.welcomeuse', '', {version: VERSION})}</Title>
        <Paragraph>
          <blockquote>{l('pages.Scheduler.label.dinkydescribe')}</blockquote>
        </Paragraph>
      </Typography>
    </Scrollbars>
  );
};

export default connect(({Scheduler}: { Scheduler: StateType }) => ({
  toolHeight: Scheduler.toolHeight,
}))(SchedulerHome);
