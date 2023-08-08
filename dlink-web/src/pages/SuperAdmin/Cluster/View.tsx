import React, { useRef, useState } from 'react'
import PageWrap from '@/components/Common/PageWrap'
import ClusterConfig from './Config'

const ClusterView: React.FC<{}> = (props: any) => {
  return (
    <PageWrap noScroll={true}>
      <ClusterConfig mode={'view'} />
    </PageWrap>
  )
}

export default ClusterView
