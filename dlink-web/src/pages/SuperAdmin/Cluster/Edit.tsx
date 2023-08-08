import React, { useRef, useState } from 'react'
import PageWrap from '@/components/Common/PageWrap'
import ClusterConfig from './Config'
const ClusterEdit: React.FC<{}> = (props: any) => {
  return (
    <PageWrap noScroll={true}>
      <ClusterConfig mode={'edit'} />
    </PageWrap>
  )
}

export default ClusterEdit
