import React, { useCallback, useEffect, useState } from 'react'
import styles from './index.less'
import { Card, Col, Form, Row } from 'antd'
import { PageContainer } from '@ant-design/pro-layout'
import CatalogueTree from './components/CatalogueTree'
const ApiCatalogue: React.FC<{}> = (props: any) => {
  return (
    <PageContainer title={false}>
      <Card className={styles['catalogue-card']} title={false} bordered={false}>
        <CatalogueTree></CatalogueTree>
      </Card>
    </PageContainer>
  )
}

export default ApiCatalogue
