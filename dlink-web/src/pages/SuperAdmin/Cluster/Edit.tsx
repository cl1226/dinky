import React, { useRef, useState } from 'react'
import { PageContainer } from '@ant-design/pro-layout'
import ClusterConfig from './Config'
const ClusterEdit: React.FC<{}> = (props: any) => {
  return (
    <PageContainer title={false}>
      <ClusterConfig mode={'edit'} />
    </PageContainer>
  )
}

export default ClusterEdit
