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

import { useCallback, useEffect, useState } from 'react'
import { connect, useModel } from 'umi'
import styles from './index.less'
import StudioMenu from './StudioMenu'
import { Card, Col, Form, Row, Tooltip, Spin } from 'antd'
import StudioTabs from './StudioTabs'
import { StateType } from '@/pages/DataStudio/model'
import StudioRightTool from './StudioRightTool'
import StudioTree from './StudioTree'
import StudioConsole from './StudioConsole'

import { MinusOutlined, SwitcherOutlined } from '@ant-design/icons'

import {
  getFillAllByVersion,
  listSession,
  showAlertGroup,
  showAlertInstance,
  showCluster,
  showClusterConfiguration,
  showDataBase,
  showEnv,
  showJars,
  showSessionCluster,
} from '@/components/Studio/StudioEvent/DDL'
import DraggleLayout from '@/components/DraggleLayout'
import { loadSettings } from '@/pages/SettingCenter/FlinkSettings/function'

const Studio = (props: any) => {
  const { initialState }: any = useModel('@@initialState')
  const { pageLoading, rightClickMenu, toolHeight, toolLeftWidth, dispatch } = props
  const [form] = Form.useForm()
  const VIEW = {
    topHeight: 32, // 顶部menu高度
    rightMargin: 32,
    leftMargin: 36,
    midMargin: 46,
  }

  const [size, setSize] = useState({
    width: document.documentElement.clientWidth,
    height: document.documentElement.clientHeight,
  })
  const onResize = useCallback(() => {
    setSize({
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
    })
  }, [])

  useEffect(() => {
    window.addEventListener('resize', onResize)
    onResize()
    return () => {
      window.removeEventListener('resize', onResize)
    }
  }, [onResize])

  useEffect(() => {
    loadSettings(dispatch)
    getFillAllByVersion('', dispatch)
    showCluster(dispatch)
    showSessionCluster(dispatch)
    showClusterConfiguration(dispatch)
    showDataBase(dispatch)
    listSession(dispatch)
    showJars(dispatch)
    showAlertInstance(dispatch)
    showAlertGroup(dispatch)
    showEnv(dispatch)
    onResize()
  }, [])

  const onClick = () => {
    if (rightClickMenu) {
      dispatch &&
        dispatch({
          type: 'Studio/showRightClickMenu',
          payload: false,
        })
    }
  }

  return (
    <div onClick={onClick} style={{ margin: '-24px' }} className={styles['studio-page']}>
      <StudioMenu />
      <Card bordered={false} className={styles.card} size="small" id="studio_card">
        <Row>
          <DraggleLayout
            containerWidth={size.width - (initialState.collapsed ? 48 : 208)}
            containerHeight={size.height - 80}
            min={VIEW.leftMargin}
            max={size.width - VIEW.rightMargin - VIEW.midMargin}
            initLeftWidth={toolLeftWidth}
            isLeft={true}
            handler={
              <div
                style={{
                  width: 4,
                  height: '100%',
                  background: 'rgb(240, 240, 240)',
                }}
              />
            }
          >
            <Col style={{ width: toolLeftWidth, height: '100%' }}>
              <StudioTree width={toolLeftWidth} />
            </Col>
            <Spin spinning={pageLoading}>
              <Row style={{ height: size.height - 48 - VIEW.topHeight }}>
                <Col style={{ width: 'calc(100% - 32px)' }}>
                  <Row style={{ height: size.height - 48 - VIEW.topHeight - toolHeight }}>
                    <Col span={24} style={{ height: '100%' }}>
                      <StudioTabs />
                    </Col>
                  </Row>
                  <Row style={{ height: toolHeight }}>
                    <Col span={24}>
                      <StudioConsole height={toolHeight} />
                    </Col>
                  </Row>
                </Col>
                <Col className={styles['vertical-tabs']} style={{ bottom: toolHeight }}>
                  <StudioRightTool form={form} />
                </Col>
              </Row>

              {/* <DraggleVerticalLayout
                containerWidth={size.width - toolLeftWidth - 250}
                containerHeight={(size.height - VIEW.marginTop)}
                min={(VIEW.topHeight)}
                max={(size.height - VIEW.bottomHeight)}
                initTopHeight={VIEW.topHeight}
                handler={
                  <div
                    style={{
                      height: 4,
                      width: '100%',
                      background: 'rgb(240, 240, 240)',
                    }}
                  />
                }
              >

                </DraggleVerticalLayout> */}
            </Spin>
          </DraggleLayout>
        </Row>
      </Card>
    </div>
  )
}

export default connect(({ Studio }: { Studio: StateType }) => ({
  pageLoading: Studio.pageLoading,
  rightClickMenu: Studio.rightClickMenu,
  toolHeight: Studio.toolHeight,
  toolLeftWidth: Studio.toolLeftWidth,
}))(Studio)
