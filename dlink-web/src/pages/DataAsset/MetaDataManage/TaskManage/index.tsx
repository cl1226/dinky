import { useState, useEffect } from 'react'
import PageWrap from '@/components/Common/PageWrap'
import CatalogueTree from './components/CatalogueTree'
import TaskList from './components/TaskList'
import type { TreeDataNode } from '@/components/Scheduler/SchedulerTree/Function'
const TaskManage = () => {
  const [catalogue, setcatalogue] = useState<TreeDataNode>()
  const getCurrentCatalogue = (node: TreeDataNode) => {
    setcatalogue(node)
  }
  return (
    <PageWrap>
      <CatalogueTree getCurrentCatalogue={getCurrentCatalogue} />

      <TaskList catalogue={catalogue} />
    </PageWrap>
  )
}

export default TaskManage
