import React, { useState, useEffect } from 'react'
import styles from './index.less'
import { Spin } from 'antd'
import { connect } from 'umi'

import { StateType } from '@/pages/DataAsset/DataMap/model'
import PageWrap from '@/components/Common/PageWrap'
import Filter from './Filter'
import Property from './Property'

const DirectoryPage = (props) => {
  const tabs = [
    {
      label: `技术资产`,
      key: 'tech',
      children: (
        <Spin spinning={props.pageLoading}>
          <div style={{ display: 'flex' }}>
            <Filter></Filter>
            <Property></Property>
          </div>
        </Spin>
      ),
    },
  ]

  return <PageWrap tabs={tabs}></PageWrap>
}

export default connect(({ DataAssetMap }: { DataAssetMap: StateType }) => ({
  pageLoading: DataAssetMap.directoryPageLoading,
}))(DirectoryPage)
