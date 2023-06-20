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

import { Tabs, Row, Col, Tooltip, Button } from 'antd'
import {
  ContainerOutlined,
  ScheduleOutlined,
  SettingOutlined,
  RightSquareOutlined,
} from '@ant-design/icons'
import { StateType } from '@/pages/DataStudio/model'
import { connect } from 'umi'
import StudioConfig from './StudioConfig'
import StudioSetting from './StudioSetting'
import StudioSavePoint from './StudioSavePoint'
import StudioHistory from './StudioHistory'
import StudioEnvSetting from './StudioEnvSetting'
import StudioSqlConfig from './StudioSqlConfig'
import StudioUDFInfo from './StudioUDFInfo'
import StudioJarSetting from './StudioJarSetting'
import StudioTaskInfo from './StudioTaskInfo'
import { DIALECT, isSql } from '@/components/Studio/conf'
import StudioKubernetesConfig from '@/components/Studio/StudioRightTool/StudioKubernetesConfig'
import styles from './index.less'
import { l } from '@/utils/intl'
import { useState } from 'react'

const { TabPane } = Tabs

const StudioRightTool = (props: any) => {
  const { current, form } = props

  const [showTabPane, setShowTabPane] = useState(false)

  const renderPaneTop = () => (
    <Row>
      <Col span={24}>
        <div style={{ float: 'right' }}>
          <Tooltip title={l('component.minimize')}>
            <Button
              onClick={() => setShowTabPane(false)}
              type="text"
              icon={<RightSquareOutlined />}
            />
          </Tooltip>
        </div>
      </Col>
    </Row>
  )

  const renderTaskInfoContent = () => {
    return (
      <TabPane
        tab={
          <span>
            <ContainerOutlined /> {l('pages.datastudio.label.jobInfo')}
          </span>
        }
        key="StudioTaskInfo"
      >
        {renderPaneTop()}
        <StudioTaskInfo form={form} />
      </TabPane>
    )
  }

  const renderContent = () => {
    const tabPanes: any = getRenderTabPanes()
    return tabPanes.map((paneItem) => (
      <TabPane tab={paneItem.tab} key={paneItem.key}>
        {renderPaneTop()}
        {paneItem.com}
      </TabPane>
    ))
  }
  const getRenderSql = () => {
    return [
      {
        tab: (
          <span>
            <SettingOutlined /> {l('pages.datastudio.label.execConfig')}
          </span>
        ),
        key: 'StudioSqlConfig',
        com: <StudioSqlConfig form={form} />,
      },
    ]
  }
  const getRenderJar = () => {
    return [
      {
        tab: (
          <span>
            <SettingOutlined /> {l('pages.datastudio.label.jobConfig')}
          </span>
        ),
        key: 'StudioJarSetting',
        com: <StudioJarSetting form={form} />,
      },
    ]
  }
  const getRenderEnv = () => {
    return [
      {
        tab: (
          <span>
            <SettingOutlined /> {l('pages.datastudio.label.jobConfig')}
          </span>
        ),
        key: 'StudioEnvSetting',
        com: <StudioEnvSetting form={form} />,
      },
    ]
  }
  const getRenderUDF = () => {
    return [
      {
        tab: (
          <span>
            <SettingOutlined /> {l('pages.datastudio.label.udfInfo')}
          </span>
        ),
        key: 'StudioUDFInfo',
        com: <StudioUDFInfo form={form} />,
      },
    ]
  }
  const getRenderKubernetes = () => {
    return [
      {
        tab: (
          <span>
            <SettingOutlined /> {l('pages.datastudio.label.execConfig')}
          </span>
        ),
        key: 'StudioSqlConfig',
        com: <StudioKubernetesConfig form={form} />,
      },
      {
        tab: (
          <span>
            <ScheduleOutlined /> {l('pages.datastudio.label.savepoint')}
          </span>
        ),
        key: 'StudioSavePoint',
        com: <StudioSavePoint />,
      },
    ]
  }
  const getRenderFlinkSql = () => {
    return [
      {
        tab: (
          <span>
            <SettingOutlined /> {l('pages.datastudio.label.jobConfig')}
          </span>
        ),
        key: 'StudioSetting',
        com: <StudioSetting form={form} />,
      },
      {
        tab: (
          <span>
            <SettingOutlined /> {l('pages.datastudio.label.execConfig')}
          </span>
        ),
        key: 'StudioConfig',
        com: <StudioConfig form={form} />,
      },
      {
        tab: (
          <span>
            <ScheduleOutlined /> {l('pages.datastudio.label.savepoint')}
          </span>
        ),
        key: 'StudioSavePoint',
        com: <StudioSavePoint />,
      },
      {
        tab: (
          <span>
            <ScheduleOutlined /> {l('pages.datastudio.label.version')}
          </span>
        ),
        key: 'StudioHistory',
        com: <StudioHistory />,
      },
    ]
  }
  const getRenderTabPanes = () => {
    if (isSql(current.task.dialect)) {
      return getRenderSql()
    }
    if (DIALECT.FLINKJAR === current.task.dialect) {
      return getRenderJar()
    }
    if (DIALECT.FLINKSQLENV === current.task.dialect) {
      return getRenderEnv
    }
    if (
      DIALECT.JAVA === current.task.dialect ||
      DIALECT.SCALA === current.task.dialect ||
      DIALECT.PYTHON === current.task.dialect
    ) {
      return getRenderUDF()
    }

    if (DIALECT.KUBERNETES_APPLICATION === current.task.dialect) {
      return getRenderKubernetes()
    }
    return getRenderFlinkSql()
  }

  return (
    <>
      {current?.task ? (
        <Tabs
          className={[
            styles['tabcontent-wrap'],
            showTabPane ? styles['tabcontent-wrap-show'] : '',
          ].join(' ')}
          onChange={() => {
            setShowTabPane(true)
          }}
          onTabClick={() => setShowTabPane(!showTabPane)}
          defaultActiveKey="1"
          size="small"
          tabPosition="right"
        >
          {renderContent()}
          {renderTaskInfoContent()}
        </Tabs>
      ) : (
        <></>
      )}
    </>
  )
}

export default connect(({ Studio }: { Studio: StateType }) => ({
  sql: Studio.sql,
  current: Studio.current,
}))(StudioRightTool)
