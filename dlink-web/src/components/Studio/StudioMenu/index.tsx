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
import { Col, message, Modal, notification, Row, Tooltip } from 'antd'
import {
  CameraTwoTone,
  CarryOutTwoTone,
  ClusterOutlined,
  DeleteTwoTone,
  EditTwoTone,
  EnvironmentOutlined,
  FlagTwoTone,
  MessageOutlined,
  PauseCircleTwoTone,
  PlayCircleTwoTone,
  RocketTwoTone,
  SafetyCertificateTwoTone,
  SaveTwoTone,
  SmileOutlined,
  SnippetsTwoTone,
} from '@ant-design/icons'
import Divider from 'antd/es/divider'
import Button from 'antd/es/button/button'
import Breadcrumb from 'antd/es/breadcrumb/Breadcrumb'
import { StateType } from '@/pages/DataStudio/model'
import { connect } from 'umi'
import { CODE, postDataArray } from '@/components/Common/crud'
import { executeSql, getJobPlan } from '@/pages/DataStudio/service'
import StudioGraph from './StudioGraph'
import {
  cancelTask,
  developTask,
  offLineTask,
  onLineTask,
  releaseTask,
  showCluster,
  showTables,
} from '@/components/Studio/StudioEvent/DDL'
import React, { useCallback, useEffect, useState } from 'react'
import StudioExplain from '../StudioConsole/StudioExplain'
import {
  DIALECT,
  isExecuteSql,
  isOnline,
  isRunningTask,
  isSql,
  isTask,
} from '@/components/Studio/conf'
import { ModalForm } from '@ant-design/pro-form'
import SqlExport from '@/pages/DataStudio/SqlExport'
import { Dispatch } from '@@/plugin-dva/connect'
import { isDeletedTask, JOB_LIFE_CYCLE } from '@/components/Common/JobLifeCycle'
import { l } from '@/utils/intl'

const StudioMenu = (props: any) => {
  const { tabs, current, currentPath, refs, dispatch, currentSession } = props
  const [modalVisible, handleModalVisible] = useState<boolean>(false)
  const [exportModalVisible, handleExportModalVisible] = useState<boolean>(false)
  const [graphModalVisible, handleGraphModalVisible] = useState<boolean>(false)
  const [graphData, setGraphData] = useState()

  const onKeyDown = useCallback(
    (e) => {
      if (e.keyCode === 83 && (e.ctrlKey === true || e.metaKey)) {
        e.preventDefault()
        if (current) {
          props.saveTask(current)
        }
      }
    },
    [current],
  )

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [current])

  const execute = () => {
    if (!isSql(current.task.dialect) && !isOnline(current.task.type)) {
      message.warn(l('pages.datastudio.editor.execute.warn', '', { type: current.task.type }))
      return
    }
    let selectsql = null
    if (current.monaco.current) {
      let selection = current.monaco.current.editor.getSelection()
      selectsql = current.monaco.current.editor.getModel().getValueInRange(selection)
    }
    if (selectsql == null || selectsql == '') {
      selectsql = current.value
    }
    let useSession = !!currentSession.session
    let param = {
      ...current.task,
      taskId: current.task.id,
      useSession: useSession,
      session: currentSession.session,
      configJson: JSON.stringify(current.task.config),
      statement: selectsql,
    }
    const key = current.key
    const taskKey = Math.random() * 1000 + ''
    notification.success({
      message: l('pages.datastudio.editor.submiting', '', { jobName: param.jobName }),
      description: param.statement.substring(0, 40) + '...',
      duration: null,
      key: taskKey,
      icon: <SmileOutlined style={{ color: '#108ee9' }} />,
    })
    setTimeout(() => {
      refs?.history?.current?.reload()
    }, 2000)
    const result = executeSql(param)
    result.then((res) => {
      notification.close(taskKey)
      if (res.datas && res.datas.success) {
        res.datas?.jobInstanceId &&
          props.changeTaskJobInstance(current.task.id, res.datas?.jobInstanceId)
        message.success(l('pages.datastudio.editor.exec.success'))
      } else {
        message.error(l('pages.datastudio.editor.exec.error'))
      }
      let newTabs = tabs
      for (const element of newTabs.panes) {
        if (element.key == key) {
          element.console.result = res.datas
          break
        }
      }
      props.saveTabs(newTabs)
      useSession && showTables(currentSession.session, dispatch)
    })
  }

  const submit = () => {
    const taskKey = Math.random() * 1000 + ''
    Modal.confirm({
      title: l('pages.datastudio.editor.async.submit'),
      content: l('pages.datastudio.editor.async.submitConfirm', '', {
        jobName: current.task.alias,
      }),
      okText: l('button.confirm'),
      cancelText: l('button.cancel'),
      onOk: async () => {
        let task = {
          id: current.task.id,
        }
        notification.success({
          message: l('pages.datastudio.editor.async.submiting', '', {
            jobName: current.task.alias,
          }),
          description: current.task.statement,
          duration: null,
          key: taskKey,
          icon: <SmileOutlined style={{ color: '#108ee9' }} />,
        })
        setTimeout(() => {
          refs?.history?.current?.reload()
        }, 2000)
        const res = await postDataArray('/api/task/submit', [task.id])
        notification.close(taskKey)
        if (res.datas[0].success) {
          res.datas[0].jobInstanceId &&
            props.changeTaskJobInstance(current.task.id, res.datas[0].jobInstanceId)
          message.success(l('pages.datastudio.editor.async.success'))
        } else {
          message.success(l('pages.datastudio.editor.async.error'))
        }
        showCluster(dispatch)
      },
    })
  }

  const onGetStreamGraph = () => {
    let selectsql = null
    if (current.monaco.current) {
      let selection = current.monaco.current.editor.getSelection()
      selectsql = current.monaco.current.editor.getModel().getValueInRange(selection)
    }
    if (selectsql == null || selectsql == '') {
      selectsql = current.value
    }
    let useSession = !!currentSession.session
    let param = {
      ...current.task,
      useSession: useSession,
      session: currentSession.session,
      configJson: JSON.stringify(current.task.config),
      statement: selectsql,
    }
    const res = getJobPlan(param)
    handleGraphModalVisible(true)
    res.then((result) => {
      if (result.code == CODE.SUCCESS) {
        setGraphData(buildGraphData(result.datas))
      } else {
        message.error(l('pages.datastudio.editor.query.explan.error', '', { msg: result.msg }))
        setGraphData(undefined)
      }
    })
  }
  const buildGraphData = (data) => {
    let edges: any = []
    for (let i in data.nodes) {
      data.nodes[i].id = data.nodes[i].id.toString()
      data.nodes[i].value = {
        title: data.nodes[i].pact,
        items: [
          {
            text: getRangeText(data.nodes[i].description),
          },
          {
            text: '\r\nParallelism: ',
            value: '\r\n  ' + data.nodes[i].parallelism,
          },
        ],
      }
      if (data.nodes[i].inputs) {
        for (let j in data.nodes[i].inputs) {
          edges.push({
            source: data.nodes[i].inputs[j].id.toString(),
            target: data.nodes[i].id.toString(),
            value: data.nodes[i].inputs[j].ship_strategy,
          })
        }
      }
    }
    data.edges = edges
    return data
  }
  const getRangeText: any = (str: string) => {
    str = escape2Html(str)
    var canvas = getRangeText.canvas || (getRangeText.canvas = document.createElement('canvas'))
    var context = canvas.getContext('2d')
    context.font = '10px sans-serif'
    let result = ''
    let count = 1
    for (let i = 0, len = str.length; i < len; i++) {
      result += str[i]
      let width = context.measureText(result).width
      if (width >= 110 * count) {
        result += '\r\n'
        count++
      }
    }
    return result
  }

  const escape2Html = (str: string) => {
    let arrEntities = { lt: '<', gt: '>', nbsp: ' ', amp: '&', quot: '"' }
    return str.replace(/&(lt|gt|nbsp|amp|quot);/gi, function (all, t) {
      return arrEntities[t]
    })
  }

  const toReleaseTask = () => {
    Modal.confirm({
      title: l('pages.datastudio.editor.release.job'),
      content: l('pages.datastudio.editor.release.jobConfirm', '', { jobName: current.task.alias }),
      okText: l('button.confirm'),
      cancelText: l('button.cancel'),
      onOk: async () => {
        const res = releaseTask(current.task.id)
        res.then((result) => {
          if (result.code == CODE.SUCCESS) {
            props.changeTaskStep(current.task.id, JOB_LIFE_CYCLE.RELEASE)
            message.success(
              l('pages.datastudio.editor.release.job.success', '', { jobName: current.task.alias }),
            )
          } else {
            message.error(
              l('pages.datastudio.editor.release.job.error', '', { jobName: current.task.alias }),
            )
          }
        })
      },
    })
  }

  const toDevelopTask = () => {
    Modal.confirm({
      title: l('pages.datastudio.editor.edit.job'),
      content: l('pages.datastudio.editor.edit.jobConfirm', '', { jobName: current.task.alias }),
      okText: l('button.confirm'),
      cancelText: l('button.cancel'),
      onOk: async () => {
        const res = developTask(current.task.id)
        res.then((result) => {
          result.datas && props.changeTaskStep(current.task.id, JOB_LIFE_CYCLE.DEVELOP)
          if (result.code == CODE.SUCCESS) {
            message.success(
              l('pages.datastudio.editor.edit.job.success', '', { jobName: current.task.alias }),
            )
          }
        })
      },
    })
  }

  const toOnLineTask = () => {
    Modal.confirm({
      title: l('pages.datastudio.editor.online.job'),
      content: l('pages.datastudio.editor.online.jobConfirm', '', { jobName: current.task.alias }),
      okText: l('button.confirm'),
      cancelText: l('button.cancel'),
      onOk: async () => {
        const res = onLineTask(current.task.id)
        res.then((result) => {
          if (result.code === CODE.SUCCESS) {
            props.changeTaskStep(current.task.id, JOB_LIFE_CYCLE.ONLINE)
            result.datas?.jobInstanceId &&
              props.changeTaskJobInstance(current.task.id, result.datas?.jobInstanceId)
            message.success(
              l('pages.datastudio.editor.online.job.success', '', { jobName: current.task.alias }),
            )
          } else {
            message.error(
              l('pages.datastudio.editor.online.job.error', '', {
                jobName: current.task.alias,
                msg: result.msg,
              }),
            )
          }
        })
      },
    })
  }

  const handleCancelTask = (type: string) => {
    Modal.confirm({
      title: l('pages.datastudio.editor.stop.job'),
      content: l('pages.datastudio.editor.stop.jobConfirm', '', { jobName: current.task.alias }),
      okText: l('button.confirm'),
      cancelText: l('button.cancel'),
      onOk: async () => {
        const res = offLineTask(current.task.id, type)
        res.then((result) => {
          if (result.code === CODE.SUCCESS) {
            if (current.task.step === JOB_LIFE_CYCLE.ONLINE) {
              props.changeTaskStep(current.task.id, JOB_LIFE_CYCLE.RELEASE)
            }
            props.changeTaskJobInstance(current.task.id, 0)
            message.success(
              l('pages.datastudio.editor.stop.job.success', '', { jobName: current.task.alias }),
            )
          } else {
            message.error(
              l('pages.datastudio.editor.stop.job.error', '', {
                jobName: current.task.alias,
                msg: result.msg,
              }),
            )
          }
        })
      },
    })
  }

  const toOffLineTask = (type: string) => {
    Modal.confirm({
      title: l('pages.datastudio.editor.offline.job'),
      content: l('pages.datastudio.editor.offline.jobConfirm', '', { jobName: current.task.alias }),
      okText: l('button.confirm'),
      cancelText: l('button.cancel'),
      onOk: async () => {
        const res = offLineTask(current.task.id, type)
        res.then((result) => {
          if (result.code === CODE.SUCCESS) {
            props.changeTaskStep(current.task.id, JOB_LIFE_CYCLE.RELEASE)
            props.changeTaskJobInstance(current.task.id, 0)
            message.success(
              l('pages.datastudio.editor.offline.job.success', '', { jobName: current.task.alias }),
            )
          } else {
            message.error(
              l('pages.datastudio.editor.offline.job.error', '', {
                jobName: current.task.alias,
                msg: result.msg,
              }),
            )
          }
        })
      },
    })
  }

  const toCancelTask = () => {
    Modal.confirm({
      title: l('pages.datastudio.editor.delete.job'),
      content: l('pages.datastudio.editor.delete.jobConfirm', '', { jobName: current.task.alias }),
      okText: l('button.confirm'),
      cancelText: l('button.cancel'),
      onOk: async () => {
        const res = cancelTask(current.task.id)
        res.then((result) => {
          if (result.code === CODE.SUCCESS) {
            props.changeTaskStep(current.task.id, JOB_LIFE_CYCLE.CANCEL)
            message.success(
              l('pages.datastudio.editor.delete.job.success', '', { jobName: current.task.alias }),
            )
          } else {
            message.error(
              l('pages.datastudio.editor.delete.job.error', '', {
                jobName: current.task.alias,
                msg: result.msg,
              }),
            )
          }
        })
      },
    })
  }

  const isShowGetStreamGraphBtn = () => {
    return !current.task.dialect || current.task.dialect === DIALECT.FLINKSQL
  }

  const isShowExecuteBtn = () => {
    return (
      !isDeletedTask(current.task.step) &&
      isExecuteSql(current.task.dialect) &&
      !isRunningTask(current.task.jobInstanceId)
    )
  }

  const isShowSubmitBtn = () => {
    return (
      !isDeletedTask(current.task.step) &&
      isTask(current.task.dialect) &&
      !isRunningTask(current.task.jobInstanceId)
    )
  }

  const isShowCancelTaskBtn = () => {
    return (
      !isDeletedTask(current.task.step) &&
      isTask(current.task.dialect) &&
      isRunningTask(current.task.jobInstanceId)
    )
  }

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
          <Col span={18}>
            <Breadcrumb className={styles['dw-path']}>
              <EnvironmentOutlined style={{ lineHeight: '32px' }} />
              <Divider type="vertical" style={{ height: 'unset' }} />
              {getPathItem(currentPath)}
            </Breadcrumb>
            {currentSession.session && (
              <Breadcrumb className={styles['dw-path']}>
                <Divider type="vertical" />
                <MessageOutlined />
                <Divider type="vertical" />
                {currentSession.session}
                <Divider type="vertical" />
                <ClusterOutlined />
                <Divider type="vertical" />
                {currentSession.sessionConfig.useRemote
                  ? currentSession.sessionConfig.clusterName
                  : l('pages.devops.jobinfo.localenv')}
              </Breadcrumb>
            )}
          </Col>
          {current?.task ? (
            <Col span={6}>
              <Tooltip title={l('pages.datastudio.editor.save')}>
                <Button
                  type="text"
                  icon={<SaveTwoTone />}
                  onClick={() => {
                    props.saveTask(current)
                  }}
                />
              </Tooltip>
              <Tooltip title={l('pages.datastudio.editor.export')}>
                <Button
                  type="text"
                  icon={<SnippetsTwoTone />}
                  onClick={() => {
                    handleExportModalVisible(true)
                  }}
                />
              </Tooltip>
              <Divider type="vertical" />
              <Tooltip title={l('pages.datastudio.editor.check')}>
                <Button
                  type="text"
                  icon={<SafetyCertificateTwoTone />}
                  onClick={() => handleModalVisible(true)}
                />
              </Tooltip>
              {isShowGetStreamGraphBtn() && (
                <Tooltip title={l('pages.datastudio.editor.explan')}>
                  <Button type="text" icon={<FlagTwoTone />} onClick={onGetStreamGraph} />
                </Tooltip>
              )}
              {isShowExecuteBtn() && (
                <Tooltip title={l('pages.datastudio.editor.exec')}>
                  <Button
                    type="text"
                    icon={<PlayCircleTwoTone />}
                    //loading={loadings[2]}
                    onClick={execute}
                  />
                </Tooltip>
              )}
              {isShowSubmitBtn() && (
                <>
                  <Tooltip title={l('pages.datastudio.editor.exec.tip')}>
                    <Button type="text" icon={<RocketTwoTone />} onClick={submit} />
                  </Tooltip>
                </>
              )}
              {isShowCancelTaskBtn() && (
                <Tooltip title={l('pages.datastudio.editor.stop')}>
                  <Button
                    type="text"
                    icon={<PauseCircleTwoTone />}
                    onClick={() => handleCancelTask('canceljob')}
                  />
                </Tooltip>
              )}
              <Divider type="vertical" />
              {current.task.step == JOB_LIFE_CYCLE.DEVELOP ? (
                <Tooltip title={l('pages.datastudio.editor.release')}>
                  <Button type="text" icon={<CameraTwoTone />} onClick={toReleaseTask} />
                </Tooltip>
              ) : undefined}
              {current.task.step == JOB_LIFE_CYCLE.RELEASE ? (
                <>
                  <Tooltip title={l('pages.datastudio.editor.edit')}>
                    <Button type="text" icon={<EditTwoTone />} onClick={toDevelopTask} />
                  </Tooltip>
                  <Tooltip title={l('pages.datastudio.editor.online')}>
                    <Button type="text" icon={<CarryOutTwoTone />} onClick={toOnLineTask} />
                  </Tooltip>
                </>
              ) : undefined}
              {current.task.step == JOB_LIFE_CYCLE.ONLINE ? (
                <Tooltip title={l('pages.datastudio.editor.offline')}>
                  <Button
                    type="text"
                    icon={<PauseCircleTwoTone />}
                    onClick={() => toOffLineTask('cancel')}
                  />
                </Tooltip>
              ) : undefined}
              {current.task.step != JOB_LIFE_CYCLE.ONLINE &&
              current.task.step != JOB_LIFE_CYCLE.CANCEL ? (
                <Tooltip title={l('pages.datastudio.editor.delete')}>
                  <Button type="text" icon={<DeleteTwoTone />} onClick={toCancelTask} />
                </Tooltip>
              ) : undefined}
            </Col>
          ) : null}
        </Row>
      </Col>
      {/* 检查当前d的sql */}
      <StudioExplain
        modalVisible={modalVisible}
        onClose={() => {
          handleModalVisible(false)
        }}
      />
      {/* 获取当前的 FlinkSql 的执行图 */}
      <Modal
        width={1000}
        bodyStyle={{ padding: '32px 40px 48px' }}
        destroyOnClose
        title={l('pages.datastudio.editor.explan.tip')}
        visible={graphModalVisible}
        onCancel={() => handleGraphModalVisible(false)}
      >
        <StudioGraph data={graphData} />
      </Modal>

      {/* 导出当前的 Sql 及配置 */}
      {current?.task ? (
        <ModalForm
          title={`${current.task.alias} 的 ${current.task.dialect} 导出`}
          visible={exportModalVisible}
          width={1000}
          modalProps={{
            maskClosable: false,
            bodyStyle: {
              padding: '5px',
            },
          }}
          onVisibleChange={handleExportModalVisible}
          submitter={{
            submitButtonProps: {
              style: {
                display: 'none',
              },
            },
          }}
        >
          <SqlExport id={current.task.id} />
        </ModalForm>
      ) : undefined}
    </Row>
  )
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  saveTask: (current: any) =>
    dispatch({
      type: 'Studio/saveTask',
      payload: current.task,
    }),
  saveTabs: (tabs: any) =>
    dispatch({
      type: 'Studio/saveTabs',
      payload: tabs,
    }),
  changeTaskStep: (id: number, step: number) =>
    dispatch({
      type: 'Studio/changeTaskStep',
      payload: {
        id,
        step,
      },
    }),
  changeTaskJobInstance: (id: number, jobInstanceId: number) =>
    dispatch({
      type: 'Studio/changeTaskJobInstance',
      payload: {
        id,
        jobInstanceId,
      },
    }),
})

export default connect(
  ({ Studio }: { Studio: StateType }) => ({
    current: Studio.current,
    currentPath: Studio.currentPath,
    tabs: Studio.tabs,
    refs: Studio.refs,
    currentSession: Studio.currentSession,
  }),
  mapDispatchToProps,
)(StudioMenu)
