import React, { useState, useEffect } from 'react'
import styles from './index.less'
import { Collapse, Form } from 'antd'
import CheckGroupHelp from '@/components/SelectHelp/CheckGroupHelp'
import { EAsyncCode } from '@/components/SelectHelp/type.d'
import { connect } from 'umi'

const { Panel } = Collapse

const Filter = (props) => {
  const [form] = Form.useForm()

  const filterItems = [
    {
      title: '数据连接',
      key: 'datasourceType',
      children: <CheckGroupHelp checkAll={true} asyncCode={EAsyncCode.DBTYPE} />,
    },
    {
      title: '类型',
      key: 'itemType',
      children: <CheckGroupHelp single={true} asyncCode={EAsyncCode.ITEMTYPE} />,
    },
  ]
  const handleValueChange = () => {
    props.dispatch({
      type: 'DataDirectory/saveFilterForm',
      payload: form.getFieldsValue(),
    })
  }

  return (
    <div className={styles['filter-wrap']}>
      <div className="filter-title">
        筛选
        <div
          className="pointer-text"
          onClick={() => {
            form.setFieldsValue({
              datasourceType: [],
              itemType: [],
            })
            handleValueChange()
          }}
        >
          全部清除
        </div>
      </div>
      <div className="filter-items">
        <Form
          form={form}
          initialValues={{}}
          onValuesChange={(changedValues, allValues) => {
            handleValueChange()
          }}
        >
          <Collapse
            bordered={false}
            ghost={true}
            defaultActiveKey={filterItems.map((item) => item.key)}
          >
            {filterItems.map((item) => (
              <Panel className="filter-panel" header={item.title} key={item.key}>
                <Form.Item noStyle name={item.key}>
                  {item.children}
                </Form.Item>
              </Panel>
            ))}
          </Collapse>
        </Form>
      </div>
    </div>
  )
}
export default connect(() => ({}))(Filter)
