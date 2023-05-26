import React, { useRef, useState } from 'react'
import styles from './index.less'
import { PageContainer } from '@ant-design/pro-layout'
import ApiList from '@/pages/DataService/ApiDev/Catalogue/components/ApiList'

const ApiManagement: React.FC<{}> = (props: any) => {
  return (
    <PageContainer title={false}>
      <div className={styles.management}>
        <ApiList mode={'management'}></ApiList>
      </div>
    </PageContainer>
  )
}

export default ApiManagement
