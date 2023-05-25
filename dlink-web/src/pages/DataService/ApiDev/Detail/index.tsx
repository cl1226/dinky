import React, { useRef, useState, useEffect } from 'react'
import styles from './index.less'
import { PageContainer } from '@ant-design/pro-layout'
import { Descriptions, Row, Col, Typography, Tabs } from 'antd'
import { history, useParams } from 'umi'

import { Scrollbars } from 'react-custom-scrollbars'
import { requestApiDetail } from '@/pages/DataService/ApiDev/Edit/service'

import { CODE } from '@/components/Common/crud'
import { EAccessType, EContentType, EAuthType } from '@/utils/enum'
const { Paragraph } = Typography

const ApiDetail: React.FC<{}> = (props: any) => {
  const sref: any = React.createRef<Scrollbars>()
  const pageParams: any = useParams()
  const [loading, setLoading] = useState(true)
  const [pageTitle, setPageTitle] = useState('')
  const [detailInfo, setDetailInfo] = useState<any>({})

  const onChange = (key: string) => {
    console.log(key)
  }

  useEffect(() => {
    requestApiDetail(pageParams.id)
      .then((res) => {
        if (res.code === CODE.SUCCESS) {
          const { name } = res.datas
          setPageTitle(name)
          setDetailInfo(res.datas)
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return (
    <PageContainer title={pageTitle || false} onBack={() => history.goBack()} loading={loading}>
      <Scrollbars
        style={{ background: '#fff', height: 'calc(100vh - 48px - 98px - 48px)' }}
        ref={sref}
      >
        <div className={styles['api-detail']}>
          <Row>
            <Col span={20}>
              <Descriptions column={2} labelStyle={{ width: 100, color: '#8a8e99' }}>
                <Descriptions.Item label="ID">{detailInfo.id}</Descriptions.Item>
                <Descriptions.Item label="API名称">{detailInfo.name}</Descriptions.Item>
                <Descriptions.Item label="取数类型">
                  {EAccessType[detailInfo.accessType]}
                </Descriptions.Item>
                <Descriptions.Item label="安全认证">
                  {EAuthType[detailInfo.authType]}
                </Descriptions.Item>
                <Descriptions.Item label="创建时间">
                  {detailInfo.createTime || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="更新时间">
                  {detailInfo.updateTime || detailInfo.createTime || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="URL">
                  <Typography.Text copyable={{ text: detailInfo.absolutePath }}>
                    {detailInfo.absolutePath}
                  </Typography.Text>
                </Descriptions.Item>
                <Descriptions.Item label="描述">{detailInfo.description || '-'}</Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>
          <Tabs
            defaultActiveKey="1"
            onChange={onChange}
            type="card"
            items={[
              {
                label: '调用信息',
                key: '1',
                children: <div>调用信息</div>,
              },
              {
                label: '授权信息',
                key: '2',
                children: <div>授权信息</div>,
              },
            ]}
          />
        </div>
      </Scrollbars>
    </PageContainer>
  )
}

export default ApiDetail
