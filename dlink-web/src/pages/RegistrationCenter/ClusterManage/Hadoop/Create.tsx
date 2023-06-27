import React, { useRef, useState } from 'react'
import styles from './index.less'
import { PlusOutlined } from '@ant-design/icons'
import { Button, Card } from 'antd'
import { PageContainer } from '@ant-design/pro-layout'
import HadoopConfig from './Config'
const HadoopCreate: React.FC<{}> = (props: any) => {
  return (
    <PageContainer title={false}>
      <HadoopConfig mode={'create'} />
    </PageContainer>
  )
}

export default HadoopCreate
