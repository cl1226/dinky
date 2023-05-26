import React, { useRef, useState } from 'react'
import styles from './index.less'
import { PageContainer } from '@ant-design/pro-layout'
import type { ColumnsType } from 'antd/es/table'
import { Button, Popconfirm, Space, Tooltip } from 'antd'

import ApiList, { DataType } from '@/pages/DataService/ApiDev/Catalogue/components/ApiList'

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
