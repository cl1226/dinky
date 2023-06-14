import { Row, Descriptions, Col } from 'antd'
import styles from './index.less'
export default (props) => {
  const { basicInfo } = props
  const attributesObj = JSON.parse(basicInfo.attributes)
  return (
    <div className={styles['detail-tab-wrap']}>
      <Row>
        <Col span={16}>
          <Descriptions title="基本信息" column={2}>
            <Descriptions.Item label="数据源">{basicInfo.datasourceName}</Descriptions.Item>
            <Descriptions.Item label="数据源类型">{basicInfo.datasourceType}</Descriptions.Item>
            <Descriptions.Item label="路径">{basicInfo.position}</Descriptions.Item>
            {basicInfo.position && (
              <Descriptions.Item label="所属库">{basicInfo.position}</Descriptions.Item>
            )}
            {basicInfo.position && (
              <Descriptions.Item label="所属表">{basicInfo.position}</Descriptions.Item>
            )}
          </Descriptions>
        </Col>
      </Row>
      <Row>
        <Col span={16}>
          <Descriptions title="高级信息" column={2}>
            {Object.keys(attributesObj).map((objKey) => (
              <Descriptions.Item label={objKey}>{attributesObj[objKey] || '-'}</Descriptions.Item>
            ))}
          </Descriptions>
        </Col>
      </Row>
    </div>
  )
}
