import { Card, Descriptions, Space } from 'antd'
import type { ITabComponentProps } from '.'
import { updateStrategyConfig } from '../Create/const'

const BaseConfig = ({ detail }: ITabComponentProps) => {
  return (
    <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
      <Card>
        <Descriptions title="基本配置" colon={false} column={2} labelStyle={{ width: 200 }}>
          <Descriptions.Item label="任务名称">{detail?.name}</Descriptions.Item>
          <Descriptions.Item label="选择目录">{detail?.path}</Descriptions.Item>
          <Descriptions.Item label="描述">{detail?.description}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card>
        <Descriptions title="数据源信息" colon={false} column={2} labelStyle={{ width: 200 }}>
          <Descriptions.Item label="数据连接类型">{detail?.datasourceType}</Descriptions.Item>
          <Descriptions.Item label="数据连接">{detail?.datasourceName}</Descriptions.Item>
          <Descriptions.Item label="数据库">ALL</Descriptions.Item>
          <Descriptions.Item label="数据表">ALL</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card>
        <Descriptions title="元数据采集" colon={false} column={2} labelStyle={{ width: 200 }}>
          <Descriptions.Item label="数据源元数据已更新">
            {updateStrategyConfig[detail?.updateStrategy]}
          </Descriptions.Item>
          <Descriptions.Item label="数据源元数据已删除">
            {updateStrategyConfig[detail?.deleteStrategy]}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </Space>
  )
}

export default BaseConfig
