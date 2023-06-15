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
  afterAsync?: (options?: any) => void
}
export default (props: ISelectProps) => {
  const {
    asyncCode,
    asyncParams,
    optionFormatter = (option) => option,
    defaultSelectFirst,
    afterAsync,
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

      afterAsync && afterAsync(formatOptions)
    })()
  }, [asyncCode, asyncParams && JSON.stringify(asyncParams)])

  return (
    <Select value={value} onChange={onChange} {...remainProps} options={options}>
      {props.children}
    </Select>
  )
}
