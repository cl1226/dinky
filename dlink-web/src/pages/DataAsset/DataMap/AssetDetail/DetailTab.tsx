import { Row, Descriptions, Col } from 'antd'
import styles from './index.less'
import { history, connect } from 'umi'

const DetailTab = (props) => {
  const { basicInfo } = props
  const attributesObj = JSON.parse(basicInfo.attributes || '{}')

  return (
    <div className={styles['detail-tab-wrap']}>
      <Row>
        <Col span={16}>
          <Descriptions title="基本信息" column={2}>
            <Descriptions.Item label="名称">{basicInfo.name}</Descriptions.Item>
            {basicInfo.columnType && (
              <Descriptions.Item label="字段类型">{basicInfo.columnType}</Descriptions.Item>
            )}
            <Descriptions.Item label="数据源">{basicInfo.datasourceName}</Descriptions.Item>
            <Descriptions.Item label="数据源类型">{basicInfo.datasourceType}</Descriptions.Item>
            <Descriptions.Item label="路径">{basicInfo.position}</Descriptions.Item>
            {basicInfo.dbName && (
              <Descriptions.Item label="所属库">
                <a
                  onClick={() => {
                    props.dispatch({
                      type: 'AssetDetail/openTab',
                      payload: {
                        itemType: 'Database',
                        id: basicInfo.dbId,
                      },
                    })
                  }}
                >
                  {basicInfo.dbName}
                </a>
              </Descriptions.Item>
            )}
            {basicInfo.tableName && (
              <Descriptions.Item label="所属表">
                <a
                  onClick={() => {
                    props.dispatch({
                      type: 'AssetDetail/openTab',
                      payload: {
                        itemType: 'Table',
                        id: basicInfo.tableId,
                      },
                    })
                  }}
                >
                  {basicInfo.tableName}
                </a>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="描述">{basicInfo.description}</Descriptions.Item>
          </Descriptions>
        </Col>
      </Row>
      {basicInfo.attributes && (
        <Row>
          <Col span={16}>
            <Descriptions title="高级信息" column={2}>
              {Object.keys(attributesObj).map((objKey) => (
                <Descriptions.Item label={objKey}>{attributesObj[objKey] || '-'}</Descriptions.Item>
              ))}
            </Descriptions>
          </Col>
        </Row>
      )}
    </div>
  )
}

export default connect(() => ({}))(DetailTab)
