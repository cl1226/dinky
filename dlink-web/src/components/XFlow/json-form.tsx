import React, { useState, useEffect } from 'react'
import styles from './index.less'
import {
  NsJsonSchemaForm,
  MODELS,
  NsGraphCmd,
  XFlowNodeCommands,
  useXFlowApp,
  XFlowGraphCommands,
  NsGraph,
} from '@antv/xflow'
import type { NsNodeCmd, IGraphCommandService, IModelService } from '@antv/xflow'
import { Scrollbars } from 'react-custom-scrollbars'
import { Descriptions, Radio, DatePicker, Input, Form, Button, Tabs, message, Modal } from 'antd'
import { CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import type { FormInstance } from 'antd'
import moment from 'moment'

import { Cron } from '@/components/Cron'
import { JobSelect } from '@/components/XFlow/components/JobSelect'
import { NS_CANVAS_FORM } from './config-model-service'
import { IMeta, ESchedulerType, getJsonCron, DIALECT } from './service'

const RangePicker: any = DatePicker.RangePicker

interface ICustomFormProps extends NsJsonSchemaForm.ICustomProps {
  form: FormInstance
}

const getNodeParams = (nodeType, formResult) => {
  if (nodeType === DIALECT.KAFKA) {
    return {}
  }
  const { jobObj } = formResult
  return {
    jobId: jobObj?.id || '',
    jobName: jobObj?.name || '',
  }
}

const compareFormJson = (newObj, oldJson) => {
  const oldObj = JSON.parse(oldJson || '{}')

  return Object.keys(newObj).some((key) => {
    if (!newObj[key] && !oldObj[key]) return false
    return newObj[key] !== oldObj[key]
  })
}
const DescriptionsText = (props) => {
  return <span>{props.value}</span>
}

export const getVerticalTabs: (options) => React.FC<NsJsonSchemaForm.ICustomProps> =
  (options) => (props) => {
    const { width } = options
    const { targetType, commandService, modelService, targetData } = props
    const [showTabPane, setShowTabPane] = useState(false)
    const sref: any = React.createRef<Scrollbars>()
    const [nodeForm] = Form.useForm()

    const getTabs = () => {
      const tabs: any = []
      if (targetType === 'canvas') {
        tabs.push({
          label: '作业信息',
          key: 'taskInfo',
          children: <CanvasCustomRender {...props} />,
        })
      } else {
        tabs.push({
          label: '节点信息',
          key: 'nodeInfo',
          children: <NodeCustomRender form={nodeForm} {...props} />,
        })
      }
      return tabs.map((item) => ({
        ...item,
        children: (
          <div className={styles['json-form']}>
            <div className="info-title">
              {item.label}
              <div className="close-box" onClick={onClose}>
                <CloseCircleOutlined />
              </div>
            </div>
            <div className="info-wrap">
              <Scrollbars style={{ height: '100%' }} ref={sref}>
                <div className="info-content">{item.children}</div>
              </Scrollbars>
            </div>
          </div>
        ),
      }))
    }
    useEffect(() => {
      if (!showTabPane && targetType === 'node') {
        Promise.resolve().then(() => {
          setShowTabPane(true)
        })
      }
    }, [targetType])

    const onClose = async () => {
      if (targetType === 'node') {
        const result = await nodeForm.getFieldsValue()

        const { nodeType, ...resetRes } = result
        const dataParams = getNodeParams(nodeType, resetRes)
        console.log('dataParams', dataParams)
        if (compareFormJson(dataParams, targetData?.nodeInfo)) {
          Modal.confirm({
            title: '提示',
            icon: <ExclamationCircleOutlined />,
            content: '您的修改内容未暂存，是否关闭？',
            onOk: async () => {
              await commandService.executeCommand<NsNodeCmd.SelectNode.IArgs>(
                XFlowNodeCommands.SELECT_NODE.id,
                {
                  nodeIds: [],
                  resetSelection: true,
                },
              )
              setShowTabPane(false)
            },
          })
          return
        }
      }
      await commandService.executeCommand<NsNodeCmd.SelectNode.IArgs>(
        XFlowNodeCommands.SELECT_NODE.id,
        {
          nodeIds: [],
          resetSelection: true,
        },
      )
      setShowTabPane(false)
    }
    return (
      <>
        <div className={styles['vertical-tabs']}>
          <Tabs
            className={[styles['tab-tool-wrap'], showTabPane ? styles['tab-tool-show'] : ''].join(
              ' ',
            )}
            onTabClick={() => setShowTabPane(true)}
            size="small"
            tabPosition="right"
            items={getTabs()}
          ></Tabs>
        </div>
        {showTabPane ? (
          <div
            style={{ width: width - 32 }}
            onClick={onClose}
            className={styles['mask-wrap']}
          ></div>
        ) : null}
      </>
    )
  }

export const CanvasCustomRender: React.FC<NsJsonSchemaForm.ICustomProps> = (props) => {
  const { modelService } = props
  const [canvasForm] = Form.useForm()
  const [baseInfo, setBaseInfo] = useState<IMeta>({ flowId: '' })
  const [cycleVisible, setCycleVisible] = useState<boolean>(false)

  const registerModel = async () => {
    if (!modelService.findDeferredModel(NS_CANVAS_FORM.id)) {
      modelService.registerModel({
        id: NS_CANVAS_FORM.id,
        getInitialValue: () => {
          return {
            canvasForm: canvasForm,
          }
        },
      })
      return
    } else {
      const ctx = await modelService.awaitModel<NS_CANVAS_FORM.ICanvasForm>(NS_CANVAS_FORM.id)

      ctx.setValue({
        canvasForm: canvasForm,
      })
    }
  }

  const compareMeta = (meta: any) => {
    const { schedulerType, cron } = meta
    if (!schedulerType) return true
    const fieldValues = canvasForm.getFieldsValue(true)

    if (schedulerType === ESchedulerType.SINGLE) {
      return schedulerType === fieldValues.schedulerType
    } else if (schedulerType === ESchedulerType.CYCLE) {
      return cron === getJsonCron(fieldValues)
    }
    return false
  }
  React.useEffect(() => {
    ~(async () => {
      const model = await MODELS.GRAPH_META.getModel(modelService)
      model.watch(async (value) => {
        const { schedulerType, cron, ...remainMeta } = value.meta
        setBaseInfo(remainMeta)
        if (compareMeta(value.meta)) return

        if (schedulerType === ESchedulerType.CYCLE) {
          if (cron) {
            let timerange: any = []
            const { startTime, endTime, timezoneId, crontab } = JSON.parse(cron)
            if (startTime && endTime) {
              timerange = [moment(startTime), moment(endTime)]
            }

            canvasForm.setFieldsValue({
              schedulerType,
              timerange,
              timezoneId,
              crontab,
            })
            setCycleVisible(true)
            return
          }
        }
        canvasForm.setFieldsValue({
          schedulerType: ESchedulerType.SINGLE,
        })
        setCycleVisible(false)
      })
    })()

    registerModel()
  }, [])

  return (
    <>
      <Descriptions title="基本信息" column={1}>
        <Descriptions.Item label="作业ID">{baseInfo.flowId}</Descriptions.Item>
        <Descriptions.Item label="作业名称">{baseInfo.flowName}</Descriptions.Item>
        <Descriptions.Item label="作业状态">{baseInfo.status}</Descriptions.Item>
      </Descriptions>
      <Form
        name="canvasForm"
        form={canvasForm}
        initialValues={{
          timezoneId: 'Asia/Shanghai',
          timerange: [moment(), moment().add(100, 'y')],
          schedulerType: ESchedulerType.SINGLE,
        }}
      >
        <Descriptions title="调度配置" column={1} layout="vertical">
          <Descriptions.Item label="调度方式">
            <Form.Item name="schedulerType" style={{ width: '100%', marginBottom: 0 }}>
              <Radio.Group
                onChange={(e: RadioChangeEvent) => {
                  setCycleVisible(e.target.value === ESchedulerType.CYCLE)
                }}
              >
                <Radio value={ESchedulerType.SINGLE}>单次调度</Radio>
                <Radio value={ESchedulerType.CYCLE}>周期调度</Radio>
              </Radio.Group>
            </Form.Item>
          </Descriptions.Item>

          {cycleVisible ? (
            <>
              <Descriptions.Item key="timerange" label="起止时间">
                <Form.Item
                  name="timerange"
                  rules={[{ required: true, message: '请选择起止时间！' }]}
                  style={{ width: '100%' }}
                >
                  <RangePicker showTime />
                </Form.Item>
              </Descriptions.Item>
              <Descriptions.Item key="crontab" label="定时">
                <Form.Item
                  name="crontab"
                  rules={[{ required: true, message: '请选择定时！' }]}
                  style={{ width: '100%' }}
                >
                  <Cron />
                </Form.Item>
              </Descriptions.Item>
              <Descriptions.Item key="timezoneId" label="时区">
                <Form.Item
                  name="timezoneId"
                  rules={[{ required: true, message: '请选择时区！' }]}
                  style={{ width: '100%' }}
                >
                  <Input readOnly />
                </Form.Item>
              </Descriptions.Item>
            </>
          ) : null}
        </Descriptions>
      </Form>
    </>
  )
}

export const NodeCustomRender: React.FC<ICustomFormProps> = (props) => {
  console.log('NodeCustomRender', props)
  const { form } = props
  const {
    commandService,
    modelService,
  }: { commandService: IGraphCommandService; modelService: IModelService } = useXFlowApp()

  const onSave = async () => {
    const result = await form.validateFields()
    const { nodeId, nodeName, nodeType, ...resetRes } = result

    const dataParams = getNodeParams(nodeType, resetRes)
    console.log(result, dataParams)

    commandService.executeCommand<NsGraphCmd.SaveGraphData.IArgs>(
      XFlowGraphCommands.SAVE_GRAPH_DATA.id,
      {
        saveGraphDataService: async (meta, graph) => {
          /** 当前选中节点数据 */
          const nodes = await MODELS.SELECTED_NODES.useValue(modelService)
          console.log('nodes: ', nodes[0], nodes[0].data)
          if (nodes !== null && nodes.length > 0) {
            nodes[0].data.nodeInfo = JSON.stringify(dataParams)
          }
          return { err: null, data: graph, meta }
        },
      },
    )
  }
  const getFormContent = () => {
    const type = props.targetData?.nodeType
    switch (type) {
      case DIALECT.SPARK:
        return NodeCustomForm.Spark()

      default:
        return NodeCustomForm.Default()
    }
  }
  return (
    <>
      <Form
        name="nodeForm"
        form={form}
        initialValues={{
          nodeName: props.targetData?.label,
          nodeId: props.targetData?.id,
          nodeType: props.targetData?.nodeType,
        }}
      >
        <Descriptions title="基本信息" column={1}></Descriptions>

        <Form.Item label="节点类型" name="nodeType" style={{ width: '100%', marginBottom: 0 }}>
          <DescriptionsText />
        </Form.Item>
        <Form.Item label="节点ID" name="nodeId" style={{ width: '100%', marginBottom: 0 }}>
          <DescriptionsText />
        </Form.Item>
        <Form.Item
          label="节点名称"
          name="nodeName"
          // rules={[{ required: true, message: '请输入节点名称' }]}
          style={{ width: '100%', marginBottom: 0 }}
        >
          <DescriptionsText />
          {/* <Input placeholder="请输入节点名称" /> */}
        </Form.Item>

        {getFormContent()}

        <Form.Item>
          <Button style={{ marginTop: 20 }} type="primary" onClick={onSave}>
            暂存
          </Button>
        </Form.Item>
      </Form>
    </>
  )
}

export namespace NodeCustomForm {
  export const Spark = () => {}
  export const Default = () => {
    return (
      <>
        <Descriptions title="关联脚本" column={1}></Descriptions>
        <Form.Item
          label="脚本"
          name="jobObj"
          rules={[{ required: true, message: '请选择关联脚本' }]}
          style={{ width: '100%' }}
        >
          <JobSelect valueKey="Object" placeholder="请选择关联脚本" />
        </Form.Item>
      </>
    )
  }
}
