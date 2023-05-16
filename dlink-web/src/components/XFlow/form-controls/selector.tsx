import type { NsJsonSchemaForm } from '@antv/xflow'
import { DownOutlined } from '@ant-design/icons'
import { FormItemWrapper } from '@antv/xflow'
import { Form, TreeSelect } from 'antd'
import type { TreeNode } from 'antd/es/tree-select'
import React, { useState, useEffect } from 'react'
import { convertToTreeData, TreeDataNode } from '@/components/Scheduler/SchedulerTree/Function'
import { getCatalogueTreeData } from '@/pages/DataStudio/service'
import { getFlowCatalogueTreeByType } from '@/components/XFlow/service'
import { useXFlowApp, MODELS, XFlowGraphCommands } from '@antv/xflow'

export const SelectorShape: React.FC<NsJsonSchemaForm.IControlProps> = (props) => {
  const { controlSchema } = props
  const { required, tooltip, extra, name, label, placeholder } = controlSchema

  return (
    <FormItemWrapper schema={controlSchema}>
      {({ disabled, hidden, initialValue }) => {
        return (
          <Form.Item
            name={name}
            label={label}
            initialValue={initialValue}
            tooltip={tooltip}
            extra={extra}
            required={required}
            hidden={hidden}
          >
            {/* 这里的组件可以拿到onChange和value */}
            <Select controlSchema={controlSchema} placeholder={placeholder} disabled={disabled} />
          </Form.Item>
        )
      }}
    </FormItemWrapper>
  )
}

interface ISelectorProps extends NsJsonSchemaForm.IFormItemProps {
  controlSchema: NsJsonSchemaForm.IControlSchema
  placeholder?: string
  disabled: boolean
}

const Select: React.FC<ISelectorProps> = (props) => {
  const [value, setValue] = useState<string>()
  const [treeData, setTreeData] = useState<TreeDataNode[]>()
  const { commandService, modelService } = useXFlowApp()

  React.useEffect(() => {
    commandService.executeCommand<NsGraphCmd.SaveGraphData.IArgs>(
      XFlowGraphCommands.SAVE_GRAPH_DATA.id,
      {
        saveGraphDataService: async (meta, graph) => {
          /** 当前选中节点数据 */
          const nodes = await MODELS.SELECTED_NODES.useValue(modelService)
          nodes[0].data.jobId = value | ''
          return { err: null, data: graph, meta }
        },
      },
    )
  })

  useEffect(() => {
    getTreeData()
  }, [])

  const onChange = (newValue: string) => {
    setValue(newValue)
  }

  const getTreeData = async () => {
    const nodes = await MODELS.SELECTED_NODES.useValue(modelService)
    setValue(nodes[0].data.jobId)
    const { params } = nodes[0].data

    const result = await getFlowCatalogueTreeByType(params?.type)
    setTreeData(convertToTreeData(result, 0))
  }

  return (
    <TreeSelect
      showSearch
      value={value}
      dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
      treeData={treeData}
      placeholder="Please select"
      onChange={onChange}
      switcherIcon={<DownOutlined />}
      filterTreeNode={(inputValue: string, treeNode: any) => {
        return treeNode.title.includes(inputValue)
      }}
      treeLine={true}
    />
  )
}
