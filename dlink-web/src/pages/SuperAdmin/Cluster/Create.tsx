import React from 'react'
import ClusterConfig from './Config'
import PageWrap from '@/components/Common/PageWrap'

const ClusterCreate: React.FC<{}> = (props: any) => {
  return (
    <PageWrap noScroll={true}>
      <ClusterConfig mode={'create'} />
    </PageWrap>
  )
}

export default ClusterCreate
