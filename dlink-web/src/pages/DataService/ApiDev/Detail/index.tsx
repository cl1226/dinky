import React, { useRef, useState, useEffect } from 'react'
import styles from './index.less'
import { PageContainer } from '@ant-design/pro-layout'
import {
  Descriptions,
  Row,
  Col,
  Typography,
  Tabs,
  Input,
  Table,
  Space,
  Popconfirm,
  Button,
  Modal,
  Alert,
} from 'antd'
import { DesktopOutlined, ArrowRightOutlined, HddOutlined } from '@ant-design/icons'
import { history, useParams } from 'umi'
import { debounce } from 'lodash'

import { Scrollbars } from 'react-custom-scrollbars'
import { requestApiDetail } from '@/pages/DataService/ApiDev/Edit/service'

import { CODE } from '@/components/Common/crud'
import { EAccessType, EContentType, EAuthType } from '@/utils/enum'
import { EDataType } from '@/pages/DataService/ApiDev/Create/components/Parameters'
import { ETokenExpire } from '@/utils/enum'

import {
  getApplicationList,
  unbindApi,
  getApiBindAppList,
  bindAuth,
} from '@/pages/DataService/Application/service'

const { Search } = Input

const ApiDetail: React.FC<{}> = (props: any) => {
  const sref: any = React.createRef<Scrollbars>()
  const pageParams: any = useParams()
  const [loading, setLoading] = useState(true)
  const [pageTitle, setPageTitle] = useState('')
  const [detailInfo, setDetailInfo] = useState<any>({})

  const [tableLoading, setTableLoading] = useState(false)
  const [authModalVisible, setAuthModalVisible] = useState(false)
  const [authAppData, setAuthAppData] = useState([])

  const [appData, setAppData] = useState([])
  const [searchKey, setSearchKey] = useState('')
  const [pageNum, setPageNum] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [pageTotal, setPageTotal] = useState(0)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])

  useEffect(() => {
    requestApiDetail(Number(pageParams.id))
      .then((res) => {
        if (res.code === CODE.SUCCESS) {
          const { name } = res.datas
          setPageTitle(name)
          setDetailInfo(res.datas)
          getAuthAppData()
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const getAuthAppData = async () => {
    setTableLoading(true)
    const list: any = await getApiBindAppList({
      apiId: Number(pageParams.id),
    })
    setAuthAppData(list)
    setTableLoading(false)
  }

  const getAppData = async (extra?: any) => {
    setSelectedRowKeys([])
    const params = {
      pageIndex: pageNum,
      pageSize: pageSize,
      name: searchKey,
      ...(extra || {}),
    }
    const { list, total, pn, ps } = await getApplicationList(params)
    setAppData(list)
    setPageTotal(total)
    setPageNum(pn)
    setPageSize(ps)
  }

  const onUnbind = async (appId) => {
    if (tableLoading) return
    setTableLoading(true)
    const result = await unbindApi({ apiId: Number(pageParams.id), appId: appId })
    setTableLoading(false)
    if (result) {
      getAuthAppData()
    }
  }

  const submitAuth = async () => {
    const result = await bindAuth({ apiId: Number(pageParams.id), appId: selectedRowKeys[0] })

    if (result) {
      setAuthModalVisible(false)
      getAuthAppData()
    }
  }
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
                <Descriptions.Item label="请求路径">{`${detailInfo.apiPrefix}${detailInfo.path}`}</Descriptions.Item>
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

  const getAuthInfo = () => {
    const columns = [
      {
        title: '应用名称',
        dataIndex: 'name',
        key: 'name',
        width: 150,
      },
      {
        title: '应用ID',
        dataIndex: 'id',
        key: 'id',
        width: 150,
      },
      {
        title: '授权时间',
        dataIndex: 'authTime',
        key: 'authTime',
        width: 150,
      },
      {
        title: 'Token过期时间',
        dataIndex: 'expireDesc',
        key: 'expireDesc',
        width: 200,
        render: (cellValue, record) => ETokenExpire[cellValue] || '-',
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
    const appColumns = [
      {
        title: '应用名称',
        dataIndex: 'name',
        key: 'name',
        width: 150,
      },
      {
        title: '应用ID',
        dataIndex: 'id',
        key: 'id',
        width: 150,
      },
    ]
    return (
      <div className={styles['tab-wrap']}>
        <Row>
          <Button
            onClick={() => {
              setAuthModalVisible(true)
              getAppData({
                pageIndex: 1,
                pageSize: 10,
              })
            }}
          >
            授权
          </Button>
        </Row>
        <Table
          style={{ marginTop: 10 }}
          loading={tableLoading}
          rowKey="id"
          size="small"
          columns={columns}
          dataSource={authAppData}
          pagination={false}
        />

        <Modal
          width={640}
          bodyStyle={{ padding: '32px 40px 48px' }}
          destroyOnClose
          title={'添加授权'}
          open={authModalVisible}
          footer={
            <>
              <Button onClick={() => setAuthModalVisible(false)}>取消</Button>
              <Button
                type="primary"
                disabled={!(selectedRowKeys && selectedRowKeys.length)}
                onClick={() => submitAuth()}
              >
                确认授权
              </Button>
            </>
          }
          onCancel={() => setAuthModalVisible(false)}
        >
          <Alert
            message="注意"
            description="请确保授权用户为可信任用户，否则存在数据库安全风险（如数据泄露、数据库高并发访问导致宕机、SQL注入等风险）。"
            type="warning"
            showIcon
          />

          <Row justify={'end'} style={{ marginTop: 20 }}>
            <Search
              placeholder="请输入关键字"
              onSearch={() => {
                getAppData()
              }}
              onChange={debounce((e) => {
                setSearchKey(e.target.value)
              }, 150)}
              style={{ width: 200 }}
            />
          </Row>
          <Table
            style={{ marginTop: 10 }}
            rowKey="id"
            size="small"
            rowSelection={{
              type: 'radio',
              selectedRowKeys,
              onChange: (newSelectedRowKeys: React.Key[]) => {
                setSelectedRowKeys(newSelectedRowKeys)
              },
            }}
            columns={appColumns}
            dataSource={appData}
            pagination={{
              current: pageNum,
              pageSize: pageSize,
              size: 'small',
              onChange: (pn, ps) => {
                getAppData({
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
        </Modal>
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
                    copyable={{
                      text: `${detailInfo.domain}${detailInfo.apiPrefix}${detailInfo.path}`,
                    }}
                  >
                    {`${detailInfo.domain}${detailInfo.apiPrefix}${detailInfo.path}`}
                  </Typography.Text>
                </Descriptions.Item>
                <Descriptions.Item label="描述">{detailInfo.description || '-'}</Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>
          <Tabs
            className={styles['tabs-wrap']}
            defaultActiveKey="1"
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
                children: getAuthInfo(),
              },
            ]}
          />
        </div>
      </Scrollbars>
    </PageContainer>
  )
}

export default ApiDetail
