import React, { useState, useEffect } from 'react'
import { Tabs, Col, Modal, Table, Row, message } from 'antd'
import { CloseCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { NsJsonSchemaForm, MODELS } from '@antv/xflow'
import moment from 'moment'
import { Descriptions, Radio, DatePicker, Input, Form } from 'antd'
import type { RadioChangeEvent } from 'antd'
import { Cron } from '@/components/Cron'
import { NS_CANVAS_FORM } from './config-model-service'
import { IMeta, ESchedulerType, getJsonCron } from './service'
import { Scrollbars } from 'react-custom-scrollbars'
import type { ColumnsType } from 'antd/es/table'
import styles from './index.less'
import { page, getTask } from '@/pages/DataStudio/service'
import { debounce } from 'lodash'
import { useXFlowApp, XFlowGraphCommands } from '@antv/xflow'
import type { NsNodeCmd } from '@antv/xflow'
import { XFlowNodeCommands } from '@antv/xflow'
// import { useTabState } from './config-model-service'
const RangePicker: any = DatePicker.RangePicker
const { Search } = Input

export interface IGetShellListParams {
  name?: string
  pageIndex: number
  pageSize: number
  dialect?: string
}

export const VerticalTabs: React.FC<NsJsonSchemaForm.ICustomProps> = (props) => {
  const { targetType, commandService, modelService } = props
  const [showTabPane, setShowTabPane] = useState(false)
  const sref: any = React.createRef<Scrollbars>()
  const refreshVisible = async (visible) => {
    if (visible) {
      // const [tabState, setTabState] = await useTabState(modelService)
      // setTabState({
      //   visible: true,
      // })
      setShowTabPane(true)
    } else {
      setShowTabPane(false)
      commandService.executeCommand<NsNodeCmd.SelectNode.IArgs>(XFlowNodeCommands.SELECT_NODE.id, {
        nodeIds: [],
        resetSelection: true,
      })
    }
  }
  const getTabs = () => {
    const tabs: any = []
    if (targetType === 'canvas') {
      tabs.push({
        label: '作业信息',
        key: 'taskInfo',
        children: <CustomJsonForm.CanvasCustomRender {...props} />,
      })
    } else {
      tabs.push({
        label: '节点信息',
        key: 'nodeInfo',
        children: <CustomJsonForm.NodeCustomRender {...props} />,
      })
    }
    return tabs.map((item) => ({
      ...item,
      children: (
        <div className={styles['json-form']}>
          <div className="info-title">
            {item.label}
            <div className="close-box" onClick={() => refreshVisible(false)}>
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
      refreshVisible(true)
    }
  }, [targetType])
  return (
    <div className={styles['vertical-tabs']}>
      <Tabs
        className={[styles['tab-tool-wrap'], showTabPane ? styles['tab-tool-show'] : ''].join(' ')}
        onTabClick={() => refreshVisible(!showTabPane)}
        onChange={() => {
          refreshVisible(true)
        }}
        size="small"
        tabPosition="right"
        items={getTabs()}
      ></Tabs>
    </div>
  )
}
export namespace CustomJsonForm {
  export const getCustomRenderComponent: NsJsonSchemaForm.ICustomRender = (
    targetType,
    targetData,
    modelService,
    commandService,
  ) => {
    return VerticalTabs
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

  export const NodeCustomRender: React.FC<NsJsonSchemaForm.ICustomProps> = (props) => {
    const [showModal, setshowModal] = useState(false)
    interface DataType {
      name: string
      type: string
      createTime: string
      updateTime: string
      path: string
    }

    const columns: ColumnsType<DataType> = [
      {
        title: '脚本名称',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '脚本类型',
        dataIndex: 'dialect',
        key: 'dialect',
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        key: 'createTime',
      },
      {
        title: '更新时间',
        dataIndex: 'updateTime',
        key: 'updateTime',
      },
      {
        title: '路径',
        dataIndex: 'path',
        key: 'path',
      },
    ]

    const [shellData, setShellData] = useState([])
    const [pageNum, setPageNum] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [pageTotal, setPageTotal] = useState(0)
    const [searchKey, setSearchKey] = useState('')
    const [dialect, setDialect] = useState('')
    const [loading, setLoading] = useState(false)
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
    const [selectedRows, setSelectedRows] = useState<DataType[]>([])
    const [selectedRow, setSelectedRow] = useState<DataType>()

    const rowSelection = {
      onChange: (selectedRowKeys: React.Key[], selectedRows: DataType[]) => {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows)
        setSelectedRowKeys(selectedRowKeys)
        setSelectedRows(selectedRows)
        setSelectedRow(selectedRows[0])
      },
    }

    const getShellList = async (extra?: IGetShellListParams) => {
      const params: IGetShellListParams = {
        pageIndex: pageNum,
        pageSize: pageSize,
        name: searchKey,
        dialect: dialect,
        ...(extra || {}),
      }

      setLoading(true)
      const result = await page(params)
      setLoading(false)
      setShellData(result.datas.records)
      setPageTotal(result.datas.total)
      setPageNum(result.datas.current)
      setPageSize(result.datas.size)
    }

    const getTaskInfo = async (id: any) => {
      const result = await getTask(id)
      setSelectedRow(result.datas)
    }

    useEffect(() => {
      getShellList()
    }, [])
    useEffect(() => {
      if (!!props && !!props.targetData && props.targetData.jobId) {
        console.log('props.targetData', props.targetData)
        getTaskInfo(props.targetData.jobId)
      }
    }, [props?.targetData?.jobId])

    const onNameChange = (e) => {
      setSearchKey(e.target.value)
    }

    const chooseShell = () => {
      if (selectedRowKeys == null) {
        message.error('请选择关联的脚本')
      } else {
        setSelectedRow(selectedRows[0])
        setshowModal(false)
        bindShell()
      }
    }

    const { commandService, modelService } = useXFlowApp()

    const bindShell = () => {
      commandService.executeCommand<NsGraphCmd.SaveGraphData.IArgs>(
        XFlowGraphCommands.SAVE_GRAPH_DATA.id,
        {
          saveGraphDataService: async (meta, graph) => {
            /** 当前选中节点数据 */
            const nodes = await MODELS.SELECTED_NODES.useValue(modelService)
            console.log('nodes: ' + nodes[0].data.jobId)
            if (nodes !== null && nodes.length > 0) {
              if (selectedRow != null) {
                nodes[0].data.jobId = selectedRow?.id
              }
              return { err: null, data: graph, meta }
            }
          },
        },
      )
    }

    return (
      <>
        <Descriptions title="基本信息" column={1}>
          <Descriptions.Item label="节点ID">{props.targetData?.id}</Descriptions.Item>
          <Descriptions.Item label="节点名称">{props.targetData?.label}</Descriptions.Item>
        </Descriptions>
        <Descriptions title="关联脚本" column={1}>
          <Descriptions.Item label="脚本">
            <Input
              placeholder="请选择关联脚本"
              value={selectedRow?.name}
              suffix={<PlusOutlined onClick={() => setshowModal(!showModal)} />}
            ></Input>
          </Descriptions.Item>
        </Descriptions>

        <Modal
          title="关联脚本"
          centered
          open={showModal}
          onOk={() => chooseShell()}
          onCancel={() => setshowModal(false)}
          width={800}
        >
          <Scrollbars style={{ height: 450 }}>
            <Row justify={'end'}>
              <Search
                placeholder="请输入脚本名称"
                onSearch={() => {
                  getShellList()
                }}
                onChange={debounce(onNameChange, 150)}
                style={{ width: 200 }}
              />
            </Row>
            <Table
              rowSelection={{
                type: 'radio',
                ...rowSelection,
              }}
              rowKey="id"
              loading={loading}
              columns={columns}
              dataSource={shellData}
              scroll={{ y: 300 }}
              size="small"
              pagination={{
                current: pageNum,
                pageSize: pageSize,
                size: 'small',
                onChange: (pn, ps) => {
                  getShellList({
                    pageIndex: pn,
                    pageSize: ps,
                  })
                },
                total: pageTotal,
                showTotal: (total) => `共 ${total} 条`,
                showSizeChanger: true,
                showQuickJumper: true,
              }}
            />
          </Scrollbars>
        </Modal>
      </>
    )
  }
}
