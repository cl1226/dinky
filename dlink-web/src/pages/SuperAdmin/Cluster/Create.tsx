import React from 'react'
import { PageContainer } from '@ant-design/pro-layout'
import ClusterConfig from './Config'
const ClusterCreate: React.FC<{}> = (props: any) => {
  return (
    <PageContainer title={false}>
      <ClusterConfig mode={'create'} />
    </PageContainer>
  )
}

export default ClusterCreate
