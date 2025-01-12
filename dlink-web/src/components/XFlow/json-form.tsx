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
  useModelAsync,
} from '@antv/xflow'
import type { NsNodeCmd, IGraphCommandService, IModelService } from '@antv/xflow'
import { Scrollbars } from 'react-custom-scrollbars'
import {
  Descriptions,
  Radio,
  Select,
  DatePicker,
  Input,
  Form,
  Button,
  Tabs,
  message,
  Modal,
  InputNumber,
  Switch,
} from 'antd'
import { CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import type { FormInstance } from 'antd'
import moment from 'moment'

import AceEditor from 'react-ace'
import { Cron } from '@/components/Cron'
import { KeyValue } from '@/components/KeyValue'
import { JobSelect } from '@/components/XFlow/components/JobSelect'
import { JarSelect } from '@/components/XFlow/components/JarSelect'
import { SourceSelect } from '@/components/XFlow/components/SourceSelect'
import SelectHelp from '@/components/SelectHelp'
import { EAsyncCode } from '@/components/SelectHelp/type.d'
import { NS_CANVAS_FORM } from './config-model-service'
import { IMeta, ESchedulerType, getJsonCron, DIALECT } from './service'
import {
  EDeployMode,
  EFileType,
  EDataFormatType,
  ESaveMode,
  ESparkVersion,
  EProgramType,
} from './type.d'
import { ETrueFalse } from '@/utils/enum'
import { EJobType } from '@/components/Scheduler/SchedulerTree/data.d'
import { transferEnumToOptions } from '@/utils/utils'

const RangePicker: any = DatePicker.RangePicker

interface ICustomFormProps extends NsJsonSchemaForm.ICustomProps {
  form: FormInstance
  onValuesChange: (changedValues, allValues) => void
  onClose: (confirm?: boolean) => void
}

const formLayout: any = {
  labelCol: { flex: '110px' },
  labelAlign: 'left',
  labelWrap: true,
  wrapperCol: { flex: 1 },
  colon: true,
}
const DescriptionsText = (props) => {
  return <span>{props.value}</span>
}

// form值 => 接口参数
const transferFormToParams = (nodeType, formResult) => {
  if (nodeType === DIALECT.FLINKSQL || nodeType === DIALECT.HIVE || nodeType === DIALECT.StarRocks) {
    const { jobObj } = formResult
    return {
      jobId: jobObj?.id || '',
      jobName: jobObj?.name || '',
    }
  } else if (nodeType === DIALECT.HDFS) {
    return {
      ...formResult,
      path: `hdfs://${formResult.path}`,
    }
  } else if (nodeType === DIALECT.InfluxDB) {
    const { startEndRange, ...resetForm } = formResult
    const [startTime, stopTime] = startEndRange || []
    return {
      ...resetForm,
      startTime: moment(startTime).format('YYYY-MM-DD HH:mm:ss'),
      stopTime: moment(stopTime).format('YYYY-MM-DD HH:mm:ss'),
    }
  }
  return formResult
}
// 接口参数 => form值
const transferParamsToForm = (nodeType, nodeProps) => {
  const { nodeInfo } = nodeProps
  if (!nodeInfo) return {}
  if (nodeType === DIALECT.HDFS) {
    return {
      ...nodeInfo,
      path: nodeInfo?.path?.split('hdfs://')?.[1] || '',
    }
  } else if (nodeType === DIALECT.FLINKSQL || nodeType === DIALECT.HIVE || nodeType === DIALECT.StarRocks) {
    const { jobId, jobName } = nodeInfo
    return {
      jobObj: { id: jobId, name: jobName },
    }
  } else if (nodeType === DIALECT.InfluxDB) {
    const { startTime, stopTime, ...resetInfo } = nodeInfo

    return {
      ...resetInfo,
      startEndRange: [moment(startTime), moment(stopTime)],
    }
  }
  return nodeInfo
}
// form默认值
const getNodeDefaultFormValue = (nodeType, nodeProps) => {
  if (nodeType === DIALECT.SPARK) {
    return {
      deployMode: EDeployMode.local,
      driverCores: 1,
      driverMemory: '512M',
      executorInstances: 2,
      executorMemory: '2G',
      executorCores: 2,
      version: ESparkVersion.SPARK2,
      programType: EProgramType.SCALA,
      maxAppAttempts: 0,
    }
  } else if (nodeType === DIALECT.FILE || nodeType === DIALECT.HDFS) {
    return {
      delimiter: ',',
      header: true,
    }
  } else if (nodeType === DIALECT.Console) {
    return {
      maxLine: 10,
    }
  } else if (nodeType === DIALECT.Mysql || nodeType === DIALECT.StarRocks) {
    return {
      numPartitions: 1,
      driver: 'com.mysql.cj.jdbc.Driver',
    }
  } else if (nodeType === DIALECT.Sqlserver) {
    return {
      numPartitions: 1,
      driver: 'com.microsoft.sqlserver.jdbc.SQLServerDriver',
    }
  } else if (nodeType === DIALECT.Repartition) {
    return {
      numPartitions: 1,
    }
  } else if (nodeType === DIALECT.KAFKA) {
    return {
      enableKerberos: false,
    }
  }
  return {}
}

export const getVerticalTabs: (options) => React.FC<NsJsonSchemaForm.ICustomProps> =
  (options) => (props) => {
    const { width } = options
    const { targetType, commandService, modelService, targetData } = props
    const [showTabPane, setShowTabPane] = useState(false)
    const [formChanged, setFormChanged] = useState(false)
    const [activeKey, setActiveKey] = useState(targetType === 'canvas' ? 'taskInfo' : 'nodeInfo')
    const sref: any = React.createRef<Scrollbars>()
    const [nodeForm] = Form.useForm()
    const [canvasForm] = Form.useForm()

    const getTabs = () => {
      const tabs: any = []
      if (targetType === 'canvas') {
        tabs.push({
          label: '作业信息',
          key: 'taskInfo',
          children: (
            <CanvasCustomRender
              form={canvasForm}
              onValuesChange={() => setFormChanged(true)}
              onClose={onClose}
              {...props}
            />
          ),
        })
      } else {
        tabs.push(
          {
            label: '节点信息',
            key: 'nodeInfo',
            children: (
              <NodeCustomRender
                form={nodeForm}
                onValuesChange={() => setFormChanged(true)}
                onClose={onClose}
                {...props}
              />
            ),
          },
          // {
          //   label: '节点测试',
          //   key: 'nodeTest',
          //   children: <span>1111</span>,
          // },
        )
      }
      return tabs.map((item) => ({
        ...item,
        children: (
          <div className={styles['json-form']}>
            <div className="info-title">
              {item.label}
              <div className="close-box" onClick={() => onClose()}>
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
          setFormChanged(false)
        })
      }
    }, [targetType])

    const onClose = async (noConfirm = false) => {
      if (!noConfirm && formChanged) {
        if (targetType === 'node' || targetType === 'canvas') {
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
            onTabClick={(key) => {
              setActiveKey(key)
              setFormChanged(false)
              setShowTabPane(true)
            }}
            size="small"
            tabPosition="right"
            activeKey={activeKey}
            items={getTabs()}
          ></Tabs>
        </div>
        {showTabPane ? (
          <div
            style={{ width: width - 32 }}
            onClick={() => onClose()}
            className={styles['mask-wrap']}
          ></div>
        ) : null}
      </>
    )
  }

export const CanvasCustomRender: React.FC<ICustomFormProps> = (props) => {
  const { form, onValuesChange, onClose } = props
  const { modelService } = props
  const [baseInfo, setBaseInfo] = useState<IMeta>({ flowId: '' })
  const [cycleVisible, setCycleVisible] = useState<boolean>(false)

  const compareMeta = (meta: any) => {
    const { schedulerType, cron } = meta
    if (!schedulerType) return true
    const fieldValues = form.getFieldsValue(true)

    if (schedulerType === ESchedulerType.SINGLE) {
      return schedulerType === fieldValues.schedulerType
    } else if (schedulerType === ESchedulerType.CYCLE) {
      return cron === getJsonCron(fieldValues)
    }
    return false
  }

  const onSave = async () => {
    const result = await form.validateFields()
    const { schedulerType } = result
    let cron: any = null
    if (schedulerType === ESchedulerType.CYCLE) {
      cron = getJsonCron(result)
    }
    const canvasFormParams = {
      schedulerType,
      cron,
    }

    const ctx = await modelService.awaitModel<NS_CANVAS_FORM.ICanvasForm>(NS_CANVAS_FORM.id)

    ctx.setValue({
      ...canvasFormParams,
    })
    onClose && onClose(true)
  }

  React.useEffect(() => {
    ~(async () => {
      const model = await MODELS.GRAPH_META.getModel(modelService)
      model.watch(async (value) => {
        const { schedulerType, cron, ...remainMeta } = value.meta
        console.log('remainMeta', remainMeta)
        setBaseInfo(remainMeta)
        if (compareMeta(value.meta)) return

        if (schedulerType === ESchedulerType.CYCLE) {
          if (cron) {
            let timerange: any = []
            const { startTime, endTime, timezoneId, crontab } = JSON.parse(cron)
            if (startTime && endTime) {
              timerange = [moment(startTime), moment(endTime)]
            }

            form.setFieldsValue({
              schedulerType,
              timerange,
              timezoneId,
              crontab,
            })
            setCycleVisible(true)
            return
          }
        }
        form.setFieldsValue({
          schedulerType: ESchedulerType.SINGLE,
        })
        setCycleVisible(false)
      })
    })()
  }, [])

  return (
    <>
      <Descriptions title="基本信息" column={1}>
        <Descriptions.Item label="作业ID">{baseInfo.flowId}</Descriptions.Item>
        <Descriptions.Item label="作业名称">{baseInfo.flowName}</Descriptions.Item>
        <Descriptions.Item label="作业状态">{baseInfo.status}</Descriptions.Item>
        <Descriptions.Item label="作业模式">
          {baseInfo.type ? EJobType[baseInfo.type] : '-'}
        </Descriptions.Item>
      </Descriptions>
      <Form
        name="canvasForm"
        form={form}
        onValuesChange={onValuesChange}
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
                onChange={(e) => {
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
        <Form.Item>
          <Button style={{ marginTop: 20 }} type="primary" onClick={onSave}>
            暂存
          </Button>
        </Form.Item>
      </Form>
    </>
  )
}

export const NodeCustomRender: React.FC<ICustomFormProps> = (props) => {
  const { form, onValuesChange, onClose } = props

  const {
    commandService,
    modelService,
  }: { commandService: IGraphCommandService; modelService: IModelService } = useXFlowApp()

  const onSave = async () => {
    const result = await form.validateFields()
    const { nodeId, nodeName, nodeType, ...resetRes } = result

    const dataParams = transferFormToParams(nodeType, resetRes)

    commandService.executeCommand<NsGraphCmd.SaveGraphData.IArgs>(
      XFlowGraphCommands.SAVE_GRAPH_DATA.id,
      {
        saveGraphDataService: async (meta, graph) => {
          /** 当前选中节点数据 */
          const nodes = await MODELS.SELECTED_NODES.useValue(modelService)
          if (nodes !== null && nodes.length > 0) {
            nodes[0].data.nodeInfo = dataParams

            commandService.executeCommand<NsNodeCmd.UpdateNode.IArgs>(
              XFlowNodeCommands.UPDATE_NODE.id,
              {
                nodeConfig: { ...nodes[0].data, label: nodeName },
              },
            )
          }
          message.success('暂存成功')
          onClose && onClose(true)
          return { err: null, data: graph, meta }
        },
      },
    )
  }
  const getFormContent = () => {
    const type = props.targetData?.nodeType
    switch (type) {
      case DIALECT.SPARK:
        return NodeCustomForm.Spark(form)
      case DIALECT.FILE:
        return NodeCustomForm.File()
      case DIALECT.FTP:
        return NodeCustomForm.Ftp()
      case DIALECT.Console:
        return NodeCustomForm.Console()
      case DIALECT.HDFS:
        return NodeCustomForm.Hdfs()
      case DIALECT.StarRocks:
        return NodeCustomForm.Default(type)
      case DIALECT.Mysql:
        return NodeCustomForm.Mysql(props.targetData?.group)
      case DIALECT.Sqlserver:
        return NodeCustomForm.Mysql(props.targetData?.group)
      case DIALECT.Shell:
        return NodeCustomForm.Shell()
      case DIALECT.Join:
        return NodeCustomForm.Join()
      case DIALECT.Repartition:
        return NodeCustomForm.Repartition()
      case DIALECT.Filter:
        return NodeCustomForm.Filter()
      case DIALECT.AddColumn:
        return NodeCustomForm.AddColumn()
      case DIALECT.InfluxDB:
        return NodeCustomForm.InfluxDB()
      case DIALECT.KAFKA:
        return NodeCustomForm.Kafka()
      default:
        return NodeCustomForm.Default(type)
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
          nodeGroup: props.targetData?.group,
          ...(props.targetData?.nodeInfo
            ? transferParamsToForm(props.targetData?.nodeType, props.targetData)
            : getNodeDefaultFormValue(props.targetData?.nodeType, props.targetData)),
        }}
        onValuesChange={onValuesChange}
        {...formLayout}
      >
        <Descriptions title="基本信息" column={1}></Descriptions>

        <Form.Item label="节点类型" name="nodeType" style={{ width: '100%', marginBottom: 0 }}>
          <DescriptionsText />
        </Form.Item>
        <Form.Item label="节点分组" name="nodeGroup" style={{ width: '100%', marginBottom: 0 }}>
          <DescriptionsText />
        </Form.Item>
        <Form.Item label="节点ID" name="nodeId" style={{ width: '100%', marginBottom: 0 }}>
          <DescriptionsText />
        </Form.Item>
        <Form.Item
          label="节点名称"
          name="nodeName"
          rules={[{ required: true, message: '请输入节点名称' }]}
          style={{ width: '100%' }}
        >
          <Input placeholder="请输入节点名称" />
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
  export const Spark = (form) => {
    return (
      <>
        <Form.Item label="描述" name="description">
          <Input.TextArea
            placeholder="请输入"
            style={{ width: '100%', resize: 'none' }}
            rows={3}
          ></Input.TextArea>
        </Form.Item>

        <Form.Item label="失败重试次数" name="maxAppAttempts">
          <InputNumber style={{ width: '100%' }} min={0} precision={0} addonAfter={'次'} />
        </Form.Item>

        <Form.Item label="程序类型" name="programType">
          <Select style={{ width: '100%' }} options={transferEnumToOptions(EProgramType)} />
        </Form.Item>
        <Form.Item label="Spark版本" name="version">
          <Select style={{ width: '100%' }} options={transferEnumToOptions(ESparkVersion)} />
        </Form.Item>
        <Form.Item
          label="主函数Class"
          name="mainClass"
          rules={[{ required: true, message: '请输入主函数的Class' }]}
        >
          <Input style={{ width: '100%' }} placeholder="请输入主函数的Class"></Input>
        </Form.Item>
        <Form.Item
          label="主程序包"
          name="mainJarPath"
          rules={[{ required: true, message: '请选择主程序包' }]}
        >
          <JarSelect style={{ width: '100%' }} placeholder="请选择主程序包" />
        </Form.Item>
        <Form.Item label="部署方式" name="deployMode">
          <Radio.Group options={transferEnumToOptions(EDeployMode)} />
        </Form.Item>
        <Form.Item label="任务名称" name="taskName">
          <Input style={{ width: '100%' }} placeholder="请输入任务名称（选填）"></Input>
        </Form.Item>

        <Form.Item label="Driver核心数" name="driverCores">
          <InputNumber style={{ width: '100%' }} min={1} precision={0} addonAfter={'个'} />
        </Form.Item>
        <Form.Item label="Driver内存数" name="driverMemory">
          <Input style={{ width: '100%' }} placeholder="请输入Driver内存数"></Input>
        </Form.Item>
        <Form.Item label="Executor数量" name="executorInstances">
          <InputNumber style={{ width: '100%' }} min={1} precision={0} addonAfter={'个'} />
        </Form.Item>
        <Form.Item label="Executor内存数" name="executorMemory">
          <Input style={{ width: '100%' }} placeholder="请输入Driver内存数"></Input>
        </Form.Item>
        <Form.Item label="Executor核心数" name="executorCores">
          <InputNumber style={{ width: '100%' }} min={1} precision={0} addonAfter={'个'} />
        </Form.Item>

        <Form.Item label="主程序参数" name="mainClassParameters">
          <Input.TextArea
            placeholder="请输入"
            style={{ resize: 'none', width: '100%' }}
            rows={3}
          ></Input.TextArea>
        </Form.Item>
        <Form.Item label="选项参数" name="optionParameters">
          <Input.TextArea
            placeholder="请输入"
            style={{ resize: 'none', width: '100%' }}
            rows={3}
          ></Input.TextArea>
        </Form.Item>

        <Form.Item
          label="资源"
          name="resourcePaths"
          rules={[{ required: true, message: '请选择资源' }]}
        >
          <SourceSelect style={{ width: '100%' }} placeholder="请选择资源" />
        </Form.Item>

        <Form.Item
          label="Hadoop集群"
          name="clusterId"
          rules={[{ required: true, message: '请选择Hadoop集群' }]}
        >
          <SelectHelp
            placeholder="请选择"
            style={{ width: '100%' }}
            asyncCode={EAsyncCode.cluster}
            optionFormatter={(options) =>
              options.map((option) => ({ label: option.name, value: option.id }))
            }
            onChange={() => {
              form.setFieldsValue({
                tenantId: '',
              })
            }}
          />
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.clusterId !== currentValues.clusterId
          }
        >
          {({ getFieldValue }) =>
            getFieldValue('clusterId') ? (
              <Form.Item label="租户" name="tenantId">
                <SelectHelp
                  placeholder="请选择"
                  style={{ width: '100%' }}
                  asyncCode={EAsyncCode.tenant}
                  asyncParams={{ clusterId: getFieldValue('clusterId') }}
                  optionFormatter={(options) =>
                    options.map((option) => ({ label: option.name, value: option.id }))
                  }
                ></SelectHelp>
              </Form.Item>
            ) : null
          }
        </Form.Item>
      </>
    )
  }
  export const File = () => {
    return (
      <>
        <Form.Item label="路径" name="path" rules={[{ required: true, message: '请输入路径' }]}>
          <Input style={{ width: '100%' }} placeholder="请输入路径"></Input>
        </Form.Item>
        <Form.Item label="类型" name="type" rules={[{ required: true, message: '请选择类型' }]}>
          <Select
            style={{ width: '100%' }}
            placeholder="请选择类型"
            options={transferEnumToOptions(EFileType)}
          />
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}
        >
          {({ getFieldValue }) => {
            if (getFieldValue('type') === EFileType.csv) {
              return (
                <>
                  <Form.Item
                    label="分隔符"
                    name="delimiter"
                    rules={[{ required: true, message: '请输入分隔符' }]}
                  >
                    <Input style={{ width: '100%' }} placeholder="请输入分隔符"></Input>
                  </Form.Item>

                  <Form.Item label="包含头" valuePropName="checked" name="header">
                    <Switch />
                  </Form.Item>
                </>
              )
            }
            if (getFieldValue('type') === EFileType.excel) {
              return (
                <Form.Item
                  label="分隔符"
                  name="delimiter"
                  rules={[{ required: true, message: '请输入分隔符' }]}
                >
                  <Input style={{ width: '100%' }} placeholder="请输入分隔符"></Input>
                </Form.Item>
              )
            }
            return null
          }}
        </Form.Item>
      </>
    )
  }
  export const Hdfs = () => {
    return (
      <>
        <Form.Item label="路径" name="path" rules={[{ required: true, message: '请输入路径' }]}>
          <Input addonBefore="hdfs://" style={{ width: '100%' }} placeholder="请输入路径"></Input>
        </Form.Item>
        <Form.Item label="类型" name="type" rules={[{ required: true, message: '请选择类型' }]}>
          <Select
            style={{ width: '100%' }}
            placeholder="请选择类型"
            options={transferEnumToOptions(EFileType)}
          />
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}
        >
          {({ getFieldValue }) => {
            if (getFieldValue('type') === EFileType.csv) {
              return (
                <>
                  <Form.Item
                    label="分隔符"
                    name="delimiter"
                    rules={[{ required: true, message: '请输入分隔符' }]}
                  >
                    <Input style={{ width: '100%' }} placeholder="请输入分隔符"></Input>
                  </Form.Item>

                  <Form.Item label="包含头" valuePropName="checked" name="header">
                    <Switch />
                  </Form.Item>
                </>
              )
            }
            if (getFieldValue('type') === EFileType.excel) {
              return (
                <Form.Item
                  label="分隔符"
                  name="delimiter"
                  rules={[{ required: true, message: '请输入分隔符' }]}
                >
                  <Input style={{ width: '100%' }} placeholder="请输入分隔符"></Input>
                </Form.Item>
              )
            }
            return null
          }}
        </Form.Item>
      </>
    )
  }
  export const Mysql = (group) => {
    const otherContent = () => {
      if (group === 'input') {
        return (
          <>
            <Form.Item label="分区字段" name="partColumnName ">
              <Input style={{ width: '100%' }} placeholder="请输入分区字段（选填）"></Input>
            </Form.Item>

            <Form.Item label="分区数" name="numPartitions">
              <InputNumber style={{ width: '100%' }} min={1} precision={0} addonAfter={'个'} />
            </Form.Item>

            <Form.Item name="sql" label="SQL">
              <AceEditor width="100%" mode="mysql" theme="github" showPrintMargin={false} />
            </Form.Item>
          </>
        )
      } else if (group === 'output') {
        return (
          <>
            <Form.Item
              label="写入模式"
              name="saveMode"
              rules={[{ required: true, message: '请选择写入模式' }]}
            >
              <Select
                style={{ width: '100%' }}
                placeholder="请选择写入模式"
                options={transferEnumToOptions(ESaveMode)}
              />
            </Form.Item>
          </>
        )
      }
      return null
    }

    return (
      <>
        <Form.Item label="URL" name="url" rules={[{ required: true, message: '请输入URL' }]}>
          <Input style={{ width: '100%' }} placeholder="请输入URL"></Input>
        </Form.Item>
        <Form.Item
          label="用户名"
          name="username"
          rules={[{ required: true, message: '请输入用户名' }]}
        >
          <Input style={{ width: '100%' }} placeholder="请输入用户名"></Input>
        </Form.Item>
        <Form.Item label="密码" name="password" rules={[{ required: true, message: '请输入密码' }]}>
          <Input.Password style={{ width: '100%' }} placeholder="请输入密码"></Input.Password>
        </Form.Item>
        <Form.Item label="驱动" name="driver" rules={[{ required: true, message: '请输入驱动' }]}>
          <Input style={{ width: '100%' }} placeholder="请输入驱动"></Input>
        </Form.Item>
        <Form.Item label="表" name="dbtable" rules={[{ required: true, message: '请输入表' }]}>
          <Input style={{ width: '100%' }} placeholder="请输入表"></Input>
        </Form.Item>
        {otherContent()}
      </>
    )
  }
  export const AddColumn = () => {
    return (
      <>
        <Form.Item wrapperCol={{ flex: '1 1' }} label="键值对" name="constantMap">
          <KeyValue name="constantMap"></KeyValue>
        </Form.Item>
      </>
    )
  }
  export const Repartition = () => {
    return (
      <>
        <Form.Item label="分区数" name="numPartitions">
          <InputNumber style={{ width: '100%' }} min={1} precision={0} addonAfter={'个'} />
        </Form.Item>
      </>
    )
  }
  export const Ftp = () => {
    return (
      <>
        <Form.Item label="主机" name="host" rules={[{ required: true, message: '请输入主机' }]}>
          <Input style={{ width: '100%' }} placeholder="请输入主机"></Input>
        </Form.Item>
        <Form.Item label="端口" name="port" rules={[{ required: true, message: '请输入端口' }]}>
          <Input style={{ width: '100%' }} placeholder="请输入端口"></Input>
        </Form.Item>
        <Form.Item
          label="用户名"
          name="username"
          rules={[{ required: true, message: '请输入用户名' }]}
        >
          <Input style={{ width: '100%' }} placeholder="请输入用户名"></Input>
        </Form.Item>
        <Form.Item label="密码" name="password" rules={[{ required: true, message: '请输入密码' }]}>
          <Input.Password style={{ width: '100%' }} placeholder="请输入密码"></Input.Password>
        </Form.Item>
        <Form.Item
          label="路径"
          name="directory"
          rules={[{ required: true, message: '请输入路径' }]}
        >
          <Input style={{ width: '100%' }} placeholder="请输入路径"></Input>
        </Form.Item>
      </>
    )
  }
  export const Console = () => {
    return (
      <>
        <Form.Item
          label="最大行数"
          name="maxLine"
          rules={[{ required: true, message: '请输入最大行数' }]}
        >
          <InputNumber style={{ width: '100%' }} min={1} precision={0} addonAfter={'行'} />
        </Form.Item>
      </>
    )
  }
  export const Shell = () => {
    return (
      <>
        <Form.Item name="script" label="脚本" rules={[{ required: true, message: '请输入脚本' }]}>
          <AceEditor width="100%" mode="mysql" theme="github" showPrintMargin={false} />
        </Form.Item>
      </>
    )
  }
  export const Filter = () => {
    return (
      <>
        <Form.Item label="条件" name="condition">
          <Input style={{ width: '100%' }} placeholder="请输入条件"></Input>
        </Form.Item>
      </>
    )
  }
  export const Join = () => {
    return (
      <>
        <Form.Item name="sql" label="SQL">
          <AceEditor width="100%" mode="mysql" theme="github" showPrintMargin={false} />
        </Form.Item>
      </>
    )
  }
  export const Kafka = () => {
    return (
      <>
        <Form.Item
          label="集群地址"
          name="servers"
          rules={[{ required: true, message: '请输入集群地址' }]}
        >
          <Input style={{ width: '100%' }} placeholder="请输入集群地址"></Input>
        </Form.Item>

        <Form.Item label="主题" name="topic" rules={[{ required: true, message: '请输入主题' }]}>
          <Input style={{ width: '100%' }} placeholder="请输入主题"></Input>
        </Form.Item>

        <Form.Item label="分组" name="groupId">
          <Input style={{ width: '100%' }} placeholder="请输入分组"></Input>
        </Form.Item>
        <Form.Item label="格式化" name="dataFormatType">
          <Select
            allowClear
            style={{ width: '100%' }}
            placeholder="请选择格式化"
            options={transferEnumToOptions(EDataFormatType)}
          />
        </Form.Item>
        <Form.Item label="认证" name="enableKerberos">
          <Radio.Group options={transferEnumToOptions(ETrueFalse)} />
        </Form.Item>

        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.enableKerberos !== currentValues.enableKerberos
          }
        >
          {({ getFieldValue }) =>
            getFieldValue('enableKerberos') ? (
              <>
                <Form.Item label="安全协议" name="protocol">
                  <Input style={{ width: '100%' }} placeholder="security.protocol"></Input>
                </Form.Item>
                <Form.Item label="认证机制" name="sasl">
                  <Input style={{ width: '100%' }} placeholder="sasl.mechanism"></Input>
                </Form.Item>
                <Form.Item label="kerberos服务名" name="saslName">
                  <Input style={{ width: '100%' }} placeholder="sasl.kerberos.service.name"></Input>
                </Form.Item>
                <Form.Item label="krb5Conf" name="krb5Conf">
                  <Input style={{ width: '100%' }} placeholder="krb5Conf"></Input>
                </Form.Item>
                <Form.Item label="jaasConf" name="jaasConf">
                  <Input style={{ width: '100%' }} placeholder="jaasConf"></Input>
                </Form.Item>
              </>
            ) : null
          }
        </Form.Item>
      </>
    )
  }
  export const InfluxDB = () => {
    return (
      <>
        <Form.Item label="URL" name="url" rules={[{ required: true, message: '请输入URL' }]}>
          <Input style={{ width: '100%' }} placeholder="请输入URL"></Input>
        </Form.Item>
        <Form.Item label="Token" name="token" rules={[{ required: true, message: '请输入Token' }]}>
          <Input style={{ width: '100%' }} placeholder="请输入Token"></Input>
        </Form.Item>
        <Form.Item label="Org" name="org" rules={[{ required: true, message: '请输入Org' }]}>
          <Input style={{ width: '100%' }} placeholder="请输入Org"></Input>
        </Form.Item>

        <Form.Item
          label="Bucket"
          name="bucket"
          rules={[{ required: true, message: '请输入Bucket' }]}
        >
          <Input style={{ width: '100%' }} placeholder="请输入Bucket"></Input>
        </Form.Item>
        <Form.Item
          label="Measurement"
          name="measurement"
          rules={[{ required: true, message: '请输入Measurement' }]}
        >
          <Input style={{ width: '100%' }} placeholder="请输入Measurement"></Input>
        </Form.Item>
        <Form.Item label="Fields" name="fields" rules={[{ required: true, message: 'Fields' }]}>
          <Input style={{ width: '100%' }} placeholder="请输入Fields"></Input>
        </Form.Item>

        <Form.Item
          label="起止时间"
          name="startEndRange"
          rules={[{ required: true, message: '请选择起止时间！' }]}
        >
          <RangePicker style={{ width: '100%' }} placeholder={['开始时间', '结束时间']} showTime />
        </Form.Item>
      </>
    )
  }
  export const Default = (type) => {
    const jobSelectDefaultParams: any = {}
    if (type === DIALECT.FLINKSQL) {
      jobSelectDefaultParams.dialect = 'FlinkSql'
    } else if (type === DIALECT.HIVE) {
      jobSelectDefaultParams.dialect = 'Hive'
    } else if (type ===DIALECT.StarRocks) {
      jobSelectDefaultParams.dialect = 'StarRocks'
    }
    return (
      <>
        <Descriptions title="关联脚本" column={1}></Descriptions>
        <Form.Item
          label="脚本"
          name="jobObj"
          rules={[{ required: true, message: '请选择关联脚本' }]}
          style={{ width: '100%' }}
        >
          <JobSelect
            defaultParams={jobSelectDefaultParams}
            valueKey="Object"
            placeholder="请选择关联脚本"
          />
        </Form.Item>
      </>
    )
  }
}
