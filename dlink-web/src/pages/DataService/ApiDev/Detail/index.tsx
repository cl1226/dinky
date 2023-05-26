import React, { useRef, useState, useEffect } from 'react'
import styles from './index.less'
import { PageContainer } from '@ant-design/pro-layout'
import { Descriptions, Row, Col, Typography, Tabs, Input, Table } from 'antd'
import { DesktopOutlined, ArrowRightOutlined, HddOutlined } from '@ant-design/icons'
import { history, useParams } from 'umi'

import { Scrollbars } from 'react-custom-scrollbars'
import { requestApiDetail } from '@/pages/DataService/ApiDev/Edit/service'

import { CODE } from '@/components/Common/crud'
import { EAccessType, EContentType, EAuthType } from '@/utils/enum'
import { EDataType } from '@/pages/DataService/ApiDev/Create/components/Parameters'

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

  const getDispatchInfo = () => {
    const getDataSource = () => {
      return JSON.parse(detailInfo?.params || '[]').map((item, index) => ({
        ...item,
        tempId: index,
      }))
    }
    const columns = [
      {
        title: '参数名',
        dataIndex: 'name',
        key: 'name',
        width: 150,
      },
      {
        title: '参数类型',
        dataIndex: 'type',
        key: 'type',
        width: 150,
        render: (cellValue, record) => {
          return EDataType[cellValue]
        },
      },
      {
        title: '入参位置',
        key: 'position',
        width: 150,
        render: (cellValue, record) => 'QUERY',
      },
      {
        title: '描述',
        dataIndex: 'description',
        key: 'description',
        width: 150,
      },
    ]
    return (
      <div className={styles['tab-wrap']}>
        <div className="description-item">
          <div className="description-label">基础定义</div>
          <div className="description-content base-define">
            <div className="icon-box">
              <DesktopOutlined style={{ fontSize: 32, marginBottom: 10 }} />
              <span>客户端</span>
            </div>
            <ArrowRightOutlined style={{ fontSize: 40, color: '#ccc' }} />
            <div className="info-box">
              <Descriptions
                title="API 请求"
                column={1}
                labelStyle={{ width: 100, color: '#8a8e99' }}
              >
                <Descriptions.Item label="域名">{detailInfo.domain || '-'}</Descriptions.Item>
                <Descriptions.Item label="请求路径">{detailInfo.path || '-'}</Descriptions.Item>
                <Descriptions.Item label="Content-Type">{detailInfo.contentType}</Descriptions.Item>
              </Descriptions>
            </div>
            <ArrowRightOutlined style={{ fontSize: 40, color: '#ccc' }} />
            <div className="info-box">
              <Descriptions title="数据源" column={1} labelStyle={{ width: 100, color: '#8a8e99' }}>
                <Descriptions.Item label="数据源类型">
                  {detailInfo.datasourceType || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="数据库">
                  {detailInfo.datasourceDb || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="sql语句">
                  <Typography.Text
                    style={{ width: 150 }}
                    ellipsis={{ tooltip: detailInfo.segment }}
                  >
                    {detailInfo.segment}
                  </Typography.Text>
                </Descriptions.Item>
              </Descriptions>
            </div>
            <ArrowRightOutlined style={{ fontSize: 40, color: '#ccc' }} />

            <div className="icon-box">
              <HddOutlined style={{ fontSize: 32, marginBottom: 10 }} />
            </div>
          </div>
        </div>

        <div className="description-item">
          <div className="description-label">入参定义</div>
          <div className="description-content">
            <Table
              style={{ width: '100%' }}
              rowKey="tempId"
              size="small"
              dataSource={getDataSource()}
              columns={columns}
              pagination={false}
            />
          </div>
        </div>

        <div className="description-item">
          <div className="description-label">成功响应示例</div>
          <div className="description-content">
            <Input.TextArea
              style={{ resize: 'none' }}
              rows={6}
              readOnly
              value={`{
                  "code": 0,
                  "datas": {},
                  "msg": "Interface request successful!",
                  "time": "2023-05-26 09:50:53"
                }`}
            ></Input.TextArea>
          </div>
        </div>

        <div className="description-item">
          <div className="description-label">失败响应示例</div>
          <div className="description-content">
            <Input.TextArea
              style={{ resize: 'none' }}
              rows={6}
              readOnly
              value={`{
                "code": 1,
                "datas": {},
                "msg": "Interface request failed",
                "time": "2023-05-26 09:51:42"
            }`}
            ></Input.TextArea>
          </div>
        </div>
      </div>
    )
  }
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
                  <Typography.Text
                    copyable={{ text: `${detailInfo.domain}${detailInfo.absolutePath}` }}
                  >
                    {`${detailInfo.domain}${detailInfo.absolutePath}`}
                  </Typography.Text>
                </Descriptions.Item>
                <Descriptions.Item label="描述">{detailInfo.description || '-'}</Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>
          <Tabs
            className={styles['tabs-wrap']}
            defaultActiveKey="1"
            onChange={onChange}
            type="card"
            items={[
              {
                label: '调用信息',
                key: '1',
                children: getDispatchInfo(),
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
