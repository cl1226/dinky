import React, { useState, useEffect } from 'react'
import { Checkbox, Row } from 'antd'
import { getCommonSelectOptions } from '@/components/Common/crud'
import type { CheckboxGroupProps, CheckboxChangeEvent } from 'antd/es/checkbox'

import type { CheckboxValueType } from 'antd/es/checkbox/Group'

import { EAsyncCode } from './type'

export interface ICheckGroupProps extends CheckboxGroupProps {
  asyncCode: EAsyncCode
  asyncParams?: any
  checkAll?: boolean
  single?: boolean
  optionFormatter?: (option: any) => any
}
export default (props: ICheckGroupProps) => {
  const {
    asyncCode,
    asyncParams,
    optionFormatter = (option) => option,
    value,
    onChange,
    checkAll,
    single,
    ...remainProps
  } = props
  const [options, setOptions] = useState<any>([])

  const onCheckAllChange = (e: CheckboxChangeEvent) => {
    onChange && onChange(e.target.checked ? options.map((item) => item.value) : [])
  }

  const onGroupChange = (checkedValue) => {
    if (single && checkedValue) {
      checkedValue = checkedValue.filter((item) => (value || []).every((jtem) => jtem !== item))
    }
    onChange && onChange(checkedValue)
  }

  useEffect(() => {
    ~(async () => {
      const options = await getCommonSelectOptions(asyncCode, asyncParams)

      const formatOptions = optionFormatter(options) || []
      setOptions(formatOptions)
    })()
  }, [asyncCode, asyncParams && JSON.stringify(asyncParams)])

  return (
    <>
      <Row>
        {!single && checkAll ? (
          <Checkbox
            indeterminate={!!(value && value.length && value.length !== options.length)}
            onChange={onCheckAllChange}
            checked={!!(value && value.length && value.length === options.length)}
          >
            ALL
          </Checkbox>
        ) : null}
      </Row>

      <Checkbox.Group options={options} value={value} onChange={onGroupChange} {...remainProps} />
    </>
  )
}
