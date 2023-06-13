import React, { useState, useEffect } from 'react'
import { Select } from 'antd'
import { getCommonSelectOptions } from '@/components/Common/crud'
import type { SelectProps } from 'antd/es/select'
import { EAsyncCode } from './type'
export interface ISelectProps extends SelectProps {
  asyncCode: EAsyncCode
  asyncParams?: any
  optionFormatter?: (option: any) => any
  defaultSelectFirst?: boolean
  afterFirstSelect?: (value, option) => void
}
export default (props: ISelectProps) => {
  const {
    asyncCode,
    asyncParams,
    optionFormatter = (option) => option,
    defaultSelectFirst,
    afterFirstSelect,
    value,
    onChange,
    ...remainProps
  } = props
  const [options, setOptions] = useState<any>([])

  useEffect(() => {
    ~(async () => {
      const options = await getCommonSelectOptions(asyncCode, asyncParams)

      const formatOptions = optionFormatter(options) || []
      setOptions(formatOptions)

      defaultSelectFirst && onChange && onChange(formatOptions[0]?.value, formatOptions[0])

      defaultSelectFirst &&
        afterFirstSelect &&
        afterFirstSelect(formatOptions[0]?.value, formatOptions[0])
    })()
  }, [asyncCode, asyncParams && JSON.stringify(asyncParams)])

  return (
    <Select value={value} onChange={onChange} {...remainProps} options={options}>
      {props.children}
    </Select>
  )
}
