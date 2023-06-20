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
import { Col, Form, InputNumber, Row, Select, Tag } from 'antd'
import styles from './index.less'
import { Scrollbars } from 'react-custom-scrollbars'
import { l } from '@/utils/intl'

const { Option } = Select

const StudioSqlConfig = (props: any) => {
  const { current, form, dispatch, tabs, database } = props

  form.setFieldsValue(current.task)

  const onValuesChange = (change: any, all: any) => {
    let newTabs = tabs
    for (let i = 0; i < newTabs.panes.length; i++) {
      if (newTabs.panes[i].key == newTabs.activeKey) {
        for (let key in change) {
          newTabs.panes[i].task[key] = change[key]
        }
        break
      }
    }

    dispatch &&
      dispatch({
        type: 'Studio/saveTabs',
        payload: newTabs,
      })
  }

  const getDataBaseOptions = () => {
    const itemList: any = []
    for (const item of database) {
      if (item.type.toUpperCase() === current.task.dialect.toUpperCase()) {
        const tag = (
          <>
            <Tag color={item.enabled ? 'processing' : 'error'}>{item.type}</Tag>
            {item.alias === '' ? item.name : item.alias}
          </>
        )
        itemList.push(
          <Option key={item.id} value={item.id} label={tag}>
            {tag}
          </Option>,
        )
      }
    }
    return itemList
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
          <Col span={24}>
            <Form.Item
              label={l('pages.datastudio.label.datasource')}
              tooltip={l('pages.datastudio.label.execConfig.selectDatabase.tip')}
              name="databaseId"
              className={styles.form_item}
            >
              <Select
                style={{ width: '100%' }}
                placeholder={l('pages.datastudio.label.execConfig.selectDatabase')}
                optionLabelProp="label"
              >
                {getDataBaseOptions()}
              </Select>
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label={l('pages.datastudio.label.maxrows')}
              className={styles.form_item}
              name="maxRowNum"
              tooltip={l('pages.datastudio.label.execConfig.maxrow.tip')}
            >
              <InputNumber min={1} max={9999} defaultValue={100} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Scrollbars>
  )
}

export default connect(({ Studio }: { Studio: StateType }) => ({
  database: Studio.database,
  current: Studio.current,
  tabs: Studio.tabs,
}))(StudioSqlConfig)
