import { Card, Form, Input, Radio, Space, TreeSelect } from 'antd'
import CatalogueSelect from '../CatalogueSelect'
import type { ICreateTaskStepComProps } from '../../index.d'
import SelectHelp from '@/components/SelectHelp'
import { EAsyncCode } from '@/components/SelectHelp/type.d'
import style from './index.less'
import { updateStrategyConfig, deleteStrategyConfig } from '../../const'

const { TextArea } = Input

const BaseSetting = ({ form, initialValues, mode }: ICreateTaskStepComProps) => {
  return (
    <Form
      name="basic"
      labelCol={{ span: 4 }}
      wrapperCol={{ span: 8 }}
      labelAlign="left"
      form={form}
      initialValues={initialValues}
      autoComplete="off"
    >
      <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
        <Card title="基本配置" bordered={false}>
          <Form.Item
            label="任务名称"
            name="name"
            rules={[{ required: true, message: '请输入任务名称!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="选择目录"
            name="catalogue"
            rules={[{ required: true, message: '请选择目录！' }]}
          >
            <CatalogueSelect />
          </Form.Item>
          <Form.Item
            label="描述"
            name="description"
            wrapperCol={{ span: 16 }}
            rules={[{ required: false, message: '请输入描述' }]}
          >
            <TextArea maxLength={300} showCount />
          </Form.Item>
        </Card>

        <Card title="数据源信息" bordered={false}>
          <Form.Item
            label="数据源类型"
            name="datasourceType"
            rules={[{ required: true, message: '请选择数据源类型' }]}
          >
            <SelectHelp
              placeholder="请选择"
              // style={{ width: 300 }}
              asyncCode={EAsyncCode.datasourceType}
              onChange={() => {
                form.setFieldsValue({
                  datasourceId: '',
                  datasourceDb: '',
                })
              }}
            />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.datasourceType !== currentValues.datasourceType
            }
          >
            {({ getFieldValue }) =>
              getFieldValue('datasourceType') || mode === 'edit' ? (
                <Form.Item
                  label="数据连接"
                  name="datasourceId"
                  rules={[{ required: true, message: '请选择数据连接' }]}
                >
                  <SelectHelp
                    placeholder="请选择"
                    //   style={{ width: 300 }}
                    asyncCode={EAsyncCode.datasourceId}
                    asyncParams={{ value: getFieldValue('datasourceType') }}
                    optionFormatter={(options) =>
                      options.map((option) => ({ label: option.name, value: option.id }))
                    }
                    onChange={() => {
                      // form.setFieldsValue({
                      //   datasourceDb: '',
                      // })
                    }}
                  />
                </Form.Item>
              ) : null
            }
          </Form.Item>

          <Form.Item label="数据库和schema">
            <Input value={'All'} readOnly />
          </Form.Item>
          <Form.Item label="数据表">
            <Input value={'All'} readOnly />
          </Form.Item>
        </Card>

        <Card title="元数据采集" bordered={false}>
          <Form.Item label="数据源元数据已更新" name="updateStrategy" rules={[{ required: false }]}>
            <Radio.Group>
              <Space direction="vertical">
                {Object.keys(updateStrategyConfig).map((i) => (
                  <Radio value={i} key={i}>
                    {updateStrategyConfig[i]}
                  </Radio>
                ))}
              </Space>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            label="数据源元数据已删除"
            name="deleteStrategy"
            rules={[{ required: false, message: '' }]}
          >
            <Radio.Group>
              <Space direction="vertical">
                {Object.keys(deleteStrategyConfig).map((i) => (
                  <Radio value={i} key={i}>
                    {deleteStrategyConfig[i]}
                  </Radio>
                ))}
              </Space>
            </Radio.Group>
          </Form.Item>
        </Card>
      </Space>
    </Form>
  )
}

export default BaseSetting
