import React, { useRef, useState, useEffect } from 'react'
import styles from './index.less'
import { PageContainer } from '@ant-design/pro-layout'
import { history, useParams } from 'umi'

import ApiTest from '@/pages/DataService/ApiDev/Create/components/ApiTest'

import { requestApiDetail } from '@/pages/DataService/ApiDev/Edit/service'

import { CODE } from '@/components/Common/crud'

const ApiDebug: React.FC<{}> = (props: any) => {
  const pageParams: any = useParams()
  const [stepBasic, setStepBasic] = useState<any>({})
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    requestApiDetail(pageParams.id)
      .then((res) => {
        if (res.code === CODE.SUCCESS) {
          const { name, path, params, segment, datasourceId } = res.datas
          setStepBasic({
            name,
            path,
            params,
            segment,
            datasourceId,
          })
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return (
    <PageContainer title={'API 调试'} onBack={() => history.goBack()} loading={loading}>
      <div className={styles['api-debug']}>
        <ApiTest stepBasic={stepBasic}></ApiTest>
      </div>
    </PageContainer>
  )
}

export default ApiDebug
