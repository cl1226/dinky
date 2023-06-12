import type { FormInstance } from 'antd'
import { Card, Form, Input, TreeSelect } from 'antd'
import CatalogueSelect from '../CatalogueSelect'
import SelectHelp, { EAsyncCode } from '@/components/SelectHelp'
import style from './index.less'

const { TextArea } = Input

export interface IBaseSettingProps {
  form: FormInstance
  values: object
  mode: 'edit' | 'create'
}

const BaseSetting = ({ form, values, mode }: IBaseSettingProps) => {
  return (
    <Form
      name="basic"
      labelCol={{ span: 4 }}
      wrapperCol={{ span: 16 }}
      labelAlign="left"
      form={form}
      initialValues={values}
      autoComplete="off"
    >
      <Card title="基本配置" bordered={false}>
        <Form.Item
          label="任务名称"
          name="taskName"
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
          name="descripts"
          rules={[{ required: false, message: '请输入描述' }]}
        >
          <TextArea maxLength={300} showCount />
        </Form.Item>
      </Card>

      <Card title="数据源信息" bordered={false} className="mt-20">
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
          <Input value={'All'} readOnly/>
        </Form.Item>
        <Form.Item label="数据表">
          <Input value={'All'} readOnly/>
        </Form.Item>
      </Card>
    </Form>
  )
}

export default BaseSetting
