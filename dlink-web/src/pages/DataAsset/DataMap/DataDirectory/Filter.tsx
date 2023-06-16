import React, { useState, useEffect } from 'react'
import styles from './index.less'
import { Collapse, Form } from 'antd'
import { connect, useLocation } from 'umi'

import CheckGroupHelp from '@/components/SelectHelp/CheckGroupHelp'
import { EAsyncCode } from '@/components/SelectHelp/type.d'
import { StateType } from '@/pages/DataAsset/DataMap/model'

const { Panel } = Collapse

const Filter = (props) => {
  const { query: pageQuery }: any = useLocation()

  const { filterForm } = props
  const [form] = Form.useForm()
  const [cacheItemTypeOptions, setCacheItemTypeOptions] = useState<
    { label: string; value: string }[]
  >([])

  const filterItems = [
    {
      title: '数据源类型',
      key: 'datasourceType',
      children: <CheckGroupHelp checkAll={true} asyncCode={EAsyncCode.DBTYPE} />,
    },
    {
      title: '类型',
      key: 'itemType',
      children: (
        <CheckGroupHelp
          afterAsync={(options) => initFilter(options)}
          single={true}
          asyncCode={EAsyncCode.ITEMTYPE}
        />
      ),
    },
  ]
  const handleValueChange = () => {
    console.log('form.getFieldsValue()', form.getFieldsValue())
    props.dispatch({
      type: 'DataAssetMap/saveFilterForm',
      payload: form.getFieldsValue(),
    })
  }
  const initFilter = (options) => {
    setCacheItemTypeOptions(options)
    if (pageQuery && Object.keys(pageQuery)) {
      const { itemType, datasourceType } = pageQuery
      form.setFieldValue('itemType', [itemType || options[0]?.value])
      datasourceType && form.setFieldValue('datasourceType', [datasourceType])
      handleValueChange()
    } else {
      if (filterForm) {
        const { itemType, datasourceType } = filterForm
        form.setFieldValue('itemType', itemType || [options[0]?.value])
        datasourceType && form.setFieldValue('datasourceType', datasourceType)
      } else {
        form.setFieldValue('itemType', [options[0]?.value])
        handleValueChange()
      }
    }
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
              itemType: [cacheItemTypeOptions[0]?.value],
            })
            handleValueChange()
          }}
        >
          重置
        </div>
      </div>
      <div className="filter-items">
        <Form
          form={form}
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
export default connect(({ DataAssetMap }: { DataAssetMap: StateType }) => ({
  filterForm: DataAssetMap.filterForm,
}))(Filter)
