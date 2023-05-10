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

import type { StepsProps } from 'antd'
import { Image, Typography, Card, Steps, Row, Col, Popover } from 'antd'
import { connect } from 'umi'
import { StateType } from '@/pages/Scheduler/model'
import { Scrollbars } from 'react-custom-scrollbars'
import { VERSION } from '@/components/Common/Version'
import { l } from '@/utils/intl'

const SchedulerHome = (props: any) => {
  const customDot: StepsProps['progressDot'] = (dot, { status, index }) => <Popover>{dot}</Popover>

  return (
    <Scrollbars style={{ height: '100%' }}>
      <Card title="快速入门" bordered={false}>
        <Row justify="space-between">
          <Col span={3}>
            <Image style={{ width: '150px' }} src={'schedule/project.png'} preview={false}></Image>
          </Col>
          <Col span={3}>
            <Image style={{ width: '150px' }} src={'schedule/develop.png'} preview={false}></Image>
          </Col>
          <Col span={3}>
            <Image style={{ width: '150px' }} src={'schedule/workflow.png'} preview={false}></Image>
          </Col>
          <Col span={3}>
            <Image style={{ width: '150px' }} src={'schedule/devops.png'} preview={false}></Image>
          </Col>
        </Row>
        <Steps
          current={4}
          progressDot={customDot}
          items={[
            {
              title: '项目管理',
              subTitle: '根目录与项目一一对应，实现工作流的快速分类。',
            },
            {
              title: '数据开发',
              subTitle: '在线脚本编辑调试、支持多种语法，轻松实现数据开发工作。',
            },
            {
              title: '流程开发',
              subTitle: '拖拽式作业开发，轻松实现工作流开发工作。',
            },
            {
              title: '运维调度',
              subTitle: '强大的作业调度与灵活的作业监控告警，轻松管理数据作业运维。',
            },
          ]}
        />
      </Card>
      <Row gutter={16}>
        <Col span={7}>
          <Card title="数据开发"></Card>
        </Col>
        <Col span={7}>
          <Card title="脚本监控"></Card>
        </Col>
        <Col span={7}>
          <Card title="调度监控"></Card>
        </Col>
      </Row>
      {/* <Typography style={{padding: '15px'}}>
        <Title level={4}>{l('pages.scheduler.label.welcomeuse', '', {version: VERSION})}</Title>
        <Paragraph>
          <blockquote>{l('pages.scheduler.label.scheduler')}</blockquote>
        </Paragraph>
        <Paragraph>
          <Image width={"100%"} src={"icons/job-develop.svg"} preview={false}></Image>
        </Paragraph>
      </Typography> */}
    </Scrollbars>
  )
}

export default connect(({ Scheduler }: { Scheduler: StateType }) => ({}))(SchedulerHome)
