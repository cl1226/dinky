import React, { useCallback, useEffect, useState } from 'react'
import { connect } from 'umi'
import styles from './index.less'
import { Card, Col, Form, Row } from 'antd'
import { PageContainer } from '@ant-design/pro-layout'
import CatalogueTree from './components/CatalogueTree'
import { StateType } from './model'
const ApiCatalogue: React.FC<{}> = (props: any) => {
  return (
    <PageContainer title={false}>
      <Card className={styles['catalogue-card']} title={false} bordered={false}>
        <CatalogueTree></CatalogueTree>
      </Card>
    </PageContainer>
  )
}

export default connect(({ Catalogue }: { Catalogue: StateType }) => ({

}))(ApiCatalogue)
