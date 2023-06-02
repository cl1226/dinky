import React, { useCallback, useEffect, useState } from 'react'
import styles from './index.less'
import { Card, Col, Input, Row, Descriptions, Space, Button, Table, Popconfirm, Alert } from 'antd'
import { PageContainer } from '@ant-design/pro-layout'
import { Scrollbars } from 'react-custom-scrollbars'
import { history, useParams } from 'umi'
import { ETokenExpire } from '@/utils/enum'
import { debounce } from 'lodash'

import {
  requestAppDetail,
  getAppBindApiList,
  unbindApi,
} from '@/pages/DataService/Application/service'
import { CODE } from '@/components/Common/crud'

const { Search } = Input

const ApplicationDetail: React.FC<{}> = (props: any) => {
  const sref: any = React.createRef<Scrollbars>()
  const { id: appId }: any = useParams()
  const [loading, setLoading] = useState(true)
  const [pageTitle, setPageTitle] = useState('')
  const [detailInfo, setDetailInfo] = useState<any>({})

  const [searchKey, setSearchKey] = useState('')
  const [pageNum, setPageNum] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [pageTotal, setPageTotal] = useState(0)
  const [bindApiData, setBindApiData] = useState([])
  const [tableLoading, setTableLoading] = useState(false)

  const getBindApiData = async (extra?: any) => {
    setTableLoading(true)
    const { list, total, pn, ps } = await getAppBindApiList({
      appId: Number(appId),
      name: searchKey,
      pageIndex: pageNum,
      pageSize: pageSize,
      ...(extra || {}),
    })

    setBindApiData(list)
    setPageTotal(total)
    setPageNum(pn)
    setPageSize(ps)
    setTableLoading(false)
  }

  const onSearchKeyChange = (e) => {
    setSearchKey(e.target.value)
  }
  const onUnbind = async (apiId) => {
    if (tableLoading) return
    setTableLoading(true)
    const result = await unbindApi({ apiId, appId: Number(appId) })
    setTableLoading(false)
    if (result) {
      getBindApiData()
    }
  }

  useEffect(() => {
    ~(async () => {
      const detailRes = await requestAppDetail(Number(appId))
      if (detailRes.code === CODE.SUCCESS) {
        const { name } = detailRes.datas
        setPageTitle(name)
        setDetailInfo(detailRes.datas)
      }
      setLoading(false)
      getBindApiData()
    })()
  }, [])

  const tableContent = () => {
    const columns = [
      {
        title: '名称',
        dataIndex: 'name',
        key: 'name',
        width: 150,
      },
      {
        title: '描述',
        dataIndex: 'description',
        key: 'description',
        width: 150,
      },
      {
        title: '授权时间',
        dataIndex: 'authTime',
        key: 'authTime',
        width: 150,
      },
      {
        title: '操作',
        width: 150,
        key: 'action',
        render: (cellValue, record) => (
          <Space size="middle">
            <Popconfirm
              title="请确认将执行解绑操作！"
              placement="bottom"
              onConfirm={() => {
                onUnbind(record.id)
              }}
            >
              <Button size="small" type="link">
                解绑
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ]

    return (
      <Table
        loading={tableLoading}
        rowKey="id"
        size="small"
        columns={columns}
        dataSource={bindApiData}
        pagination={{
          current: pageNum,
          pageSize: pageSize,
          size: 'small',
          onChange: (pn, ps) => {
            getBindApiData({
              pageIndex: pn,
              pageSize: ps,
            })
          },
          total: pageTotal,
          showTotal: (total) => `共 ${total} 条`,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
      />
    )
  }
  return (
    <PageContainer title={pageTitle || false} onBack={() => history.goBack()} loading={loading}>
      <Scrollbars
        style={{ background: '#fff', height: 'calc(100vh - 48px - 98px - 48px)' }}
        ref={sref}
      >
        <div className={styles['app-detail']}>
          <Row>
            <Col span={20}>
              <Descriptions column={2} labelStyle={{ width: 120, color: '#8a8e99' }}>
                <Descriptions.Item label="应用名称">{detailInfo.name}</Descriptions.Item>
                <Descriptions.Item label="应用ID">{detailInfo.id}</Descriptions.Item>
                <Descriptions.Item label="AppSecret">{detailInfo.secret}</Descriptions.Item>
                <Descriptions.Item label="创建时间">{detailInfo.createTime}</Descriptions.Item>
                <Descriptions.Item label="Token过期时间">
                  {ETokenExpire[detailInfo.expireDesc]}
                </Descriptions.Item>
                <Descriptions.Item label="描述">{detailInfo.description}</Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>
          <Row>
            <Alert
              type="warning"
              message={
                <>
                  <span>
                    请求私有接口时，需要把token值放入header的Authorization字段中携带，才可以访问成功。（如果是开放接口，不需要设置header）
                  </span>
                  <br />
                  <span>以python为例，访问api的代码示例如下：</span>
                  <br />
                  <br />
                  <span>import requests</span>
                  <br />
                  <span>{`headers = {"Authorization": "5ad0dcb4eb03d3b0b7e4b82ae0ba433f"}`}</span>
                  <br />
                  <span>{`re = requests.post("http://ip:port/releaseapi/test", {"id": 1}, headers=headers) `}</span>
                  <br />
                  <span>{`print(re.text)`}</span>
                  <br />
                  <br />
                  <span>token如何获取？</span>
                  <br />
                  <span>使用appid和secret访问以下接口来获取token</span>
                  <br />
                  <br />
                  <span>{`http://ip:port/token/generate?appid=xxx&secret=xxx`}</span>
                </>
              }
            ></Alert>
          </Row>
          <Row style={{ marginTop: 10, marginBottom: 5 }} justify={'space-between'}>
            <Col span={4}>
              <div style={{ lineHeight: '32px', fontSize: 18 }}>已绑定API</div>
            </Col>
            <Col span={20} style={{ textAlign: 'right' }}>
              <Search
                placeholder="请输入关键字"
                onSearch={() => {
                  getBindApiData()
                }}
                onChange={debounce(onSearchKeyChange, 150)}
                style={{ width: 200 }}
              />
            </Col>
          </Row>
          {tableContent()}
        </div>
      </Scrollbars>
    </PageContainer>
  )
}

export default ApplicationDetail
