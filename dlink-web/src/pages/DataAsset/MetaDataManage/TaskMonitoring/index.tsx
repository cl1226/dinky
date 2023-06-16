import { useState, useEffect } from 'react'
import PageWrap from '@/components/Common/PageWrap'
import TaskMonitorList from './TaskMonitorList'
import type { TreeDataNode } from '@/components/Scheduler/SchedulerTree/Function'
import CatalogueTree from '../TaskManage/components/CatalogueTree'
const TaskMonitor = () => {
  const [catalogue, setcatalogue] = useState<TreeDataNode>()
  const getCurrentCatalogue = (node: TreeDataNode) => {
    setcatalogue(node)
  }
  return (
    <PageWrap>
      <CatalogueTree simple getCurrentCatalogue={getCurrentCatalogue} />

      <TaskMonitorList catalogue={catalogue} />
    </PageWrap>
  )
}

export default TaskMonitor
