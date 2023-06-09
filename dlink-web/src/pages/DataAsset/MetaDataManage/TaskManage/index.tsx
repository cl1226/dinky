import { useState, useEffect } from 'react'
import PageWrap from '@/components/Common/PageWrap'
import CatalogueTree from './components/CatalogueTree'
import TaskList from './components/TaskList'
import type { TreeDataNode } from 'antd'
export default () => {
  const [catalogue, setcatalogue] = useState<TreeDataNode>()
  const getCurrentCatalogue = (node: TreeDataNode) => {
    setcatalogue(node)
  }
  return (
    <PageWrap>
      <CatalogueTree getCurrentCatalogue={getCurrentCatalogue} />

      <TaskList catalogue={catalogue} mode={'catalogue'} />
    </PageWrap>
  )
}
