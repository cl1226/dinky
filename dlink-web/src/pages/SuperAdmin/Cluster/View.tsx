import React, { useRef, useState } from 'react'
import styles from './index.less'
import { PageContainer } from '@ant-design/pro-layout'
import ClusterConfig from './Config'

const ClusterView: React.FC<{}> = (props: any) => {
  return (
    <PageContainer title={false}>
      <ClusterConfig mode={'view'} />
    </PageContainer>
  )
}

export default ClusterView
