import React, { useState, useEffect } from 'react'
import styles from './index.less'
import PageWrap from '@/components/Common/PageWrap'
import { Row, Card, Collapse, Spin } from 'antd'
import Filter from './Filter'
import Property from './Property'
import { connect } from 'umi'
import { StateType } from './model'

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

export default connect(({ DataDirectory }: { DataDirectory: StateType }) => ({
  pageLoading: DataDirectory.pageLoading,
}))(DirectoryPage)
