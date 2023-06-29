import { DataNode } from 'antd/lib/tree'

export interface TreeDataNode extends DataNode {
  name: string
  id: number
  taskId: number
  parentId: number
  path: string[]
  schema: string
  table: string
  value: number
}
