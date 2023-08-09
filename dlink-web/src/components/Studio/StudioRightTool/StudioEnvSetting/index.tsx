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

import { connect } from 'umi'
import { StateType } from '@/pages/DataStudio/model'
import { Col, Form, Row, Switch } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'
import styles from './index.less'
import { useEffect } from 'react'
import { JarStateType } from '@/pages/Resource/Jar/model'
import { Scrollbars } from 'react-custom-scrollbars'
import { l } from '@/utils/intl'

const StudioEnvSetting = (props: any) => {
  const { current, form, dispatch, tabs } = props

  useEffect(() => {
    form.setFieldsValue(current.task)
  }, [current.task])

  const onValuesChange = (change: any, all: any) => {
    const newTabs = tabs
    for (let i = 0; i < newTabs.panes.length; i++) {
      if (newTabs.panes[i].key === newTabs.activeKey) {
        for (const key in change) {
          newTabs.panes[i].task[key] = all[key]
        }
        break
      }
    }
    dispatch({
      type: 'Studio/saveTabs',
      payload: newTabs,
    })
  }

  return (
    <Scrollbars style={{ height: 'calc(100% - 32px)' }}>
      <Form
        form={form}
        layout="vertical"
        className={styles.form_setting}
        onValuesChange={onValuesChange}
      >
        <Row>
          <Col span={12}>
            <Form.Item
              label={l('pages.datastudio.label.jobConfig.fragment')}
              className={styles.form_item}
              name="fragment"
              valuePropName="checked"
              tooltip={{
                title: l('pages.datastudio.label.jobConfig.fragment.tip'),
                icon: <InfoCircleOutlined />,
              }}
            >
              <Switch
                checkedChildren={l('button.enable')}
                unCheckedChildren={l('button.disable')}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Scrollbars>
  )
}

export default connect(({ Studio, Jar }: { Studio: StateType; Jar: JarStateType }) => ({
  current: Studio.current,
  tabs: Studio.tabs,
  jars: Jar.jars,
}))(StudioEnvSetting)
