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

import styles from './index.less'
import { Divider, Col, Row, Breadcrumb } from 'antd'
import { EnvironmentOutlined } from '@ant-design/icons'
import { StateType } from '@/pages/Scheduler/model'
import { connect } from 'umi'

const SchedulerMenu = (props: any) => {
  const { currentPath } = props

  const getPathItem = (paths) => {
    let itemList: any = []
    for (let item of paths) {
      itemList.push(<Breadcrumb.Item key={item}>{item}</Breadcrumb.Item>)
    }
    return itemList
  }

  return (
    <Row className={styles.container}>
      <Col span={24}>
        <Row>
          <Col span={12}>
            <Breadcrumb className={styles['dw-path']}>
              <EnvironmentOutlined style={{ lineHeight: '32px' }} />
              <Divider type="vertical" style={{ height: 'unset' }} />
              {getPathItem(currentPath)}
            </Breadcrumb>
          </Col>
        </Row>
      </Col>
    </Row>
  )
}

export default connect(({ Scheduler }: { Scheduler: StateType }) => ({
  currentPath: Scheduler.currentPath,
}))(SchedulerMenu)
