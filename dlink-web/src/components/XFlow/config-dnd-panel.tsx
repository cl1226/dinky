/* eslint-disable @typescript-eslint/no-unused-vars */
import { uuidv4 } from '@antv/xflow'
import { XFlowNodeCommands } from '@antv/xflow'
import { DND_RENDER_ID } from './constant'
import type { NsNodeCmd } from '@antv/xflow'
import type { NsNodeCollapsePanel } from '@antv/xflow'
import { Avatar, Card } from 'antd'
import { getFlowTaskEnum } from './service'
import { getIcon } from './icon'

export const onNodeDrop: NsNodeCollapsePanel.IOnNodeDrop = async (node, commands, modelService) => {
  const args: NsNodeCmd.AddNode.IArgs = {
    nodeConfig: { ...node, id: uuidv4() },
  }
  commands.executeCommand(XFlowNodeCommands.ADD_NODE.id, args)
}

export const nodeDataService: NsNodeCollapsePanel.INodeDataService = async (meta, modelService) => {
  const allTaskEnum = await getFlowTaskEnum()
  return allTaskEnum.map((item) => ({
    id: item.key,
    header: item.title,
    children: item.res.map((jtem) => ({
      id: jtem.label,
      label: jtem.label,
      // renderKey: DND_RENDER_ID,
      renderComponent: (props) => (
        <div className="custom-dnd-node">
          <Avatar src={getIcon(jtem.type)}></Avatar>
          <div>{props.data.label}</div>
        </div>
      ),
      group: jtem.group,
      nodeType: jtem.type,
      nodeInfo: '',
    })),
  }))
}

export const searchService: NsNodeCollapsePanel.ISearchService = async (
  nodes: NsNodeCollapsePanel.IPanelNode[] = [],
  keyword: string,
) => {
  const list = nodes.filter((node) => node?.label?.includes(keyword))
  return list
}
