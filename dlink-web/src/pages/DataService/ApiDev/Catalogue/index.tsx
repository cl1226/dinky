import React, { useState } from 'react'
import styles from './index.less'
import { Card } from 'antd'
import { PageContainer } from '@ant-design/pro-layout'
import CatalogueTree from './components/CatalogueTree'
import ApiList from './components/ApiList'

import { TreeDataNode } from '@/components/Scheduler/SchedulerTree/Function'

const ApiCatalogue: React.FC<{}> = (props: any) => {
  const [catalogue, setcatalogue] = useState<TreeDataNode>()
  const getCurrentCatalogue = (node: TreeDataNode) => {
    setcatalogue(node)
  }
  return (
    <PageContainer title={false}>
      <Card className={styles['catalogue-card']} title={false} bordered={false}>
        <CatalogueTree getCurrentCatalogue={getCurrentCatalogue}></CatalogueTree>

        <ApiList catalogue={catalogue}></ApiList>
      </Card>
    </PageContainer>
  )
}

export default ApiCatalogue
