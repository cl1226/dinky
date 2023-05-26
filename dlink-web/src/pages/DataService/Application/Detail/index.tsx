import React, { useCallback, useEffect, useState } from 'react'
import styles from './index.less'
import { Card, Col, Form, Row } from 'antd'
import { PageContainer } from '@ant-design/pro-layout'
import { Scrollbars } from 'react-custom-scrollbars'
import { history, useParams } from 'umi'

const ApplicationDetail: React.FC<{}> = (props: any) => {
  const sref: any = React.createRef<Scrollbars>()
  const pageParams: any = useParams()
  const [loading, setLoading] = useState(true)
  const [pageTitle, setPageTitle] = useState('')
  const [detailInfo, setDetailInfo] = useState<any>({})

  return (
    <PageContainer title={pageTitle || false} onBack={() => history.goBack()} loading={loading}>
      222
    </PageContainer>
  )
}

export default ApplicationDetail
