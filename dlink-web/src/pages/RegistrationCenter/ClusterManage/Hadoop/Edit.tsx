import React, { useRef, useState } from 'react'
import styles from './index.less'
import { PlusOutlined } from '@ant-design/icons'
import { Button, Card } from 'antd'
import { PageContainer } from '@ant-design/pro-layout'
import HadoopConfig from './Config'
const HadoopEdit: React.FC<{}> = (props: any) => {
  return (
    <PageContainer title={false}>
      <HadoopConfig mode={'edit'} />
    </PageContainer>
  )
}

export default HadoopEdit
