import React, { useState, useEffect } from 'react'
import { Select } from 'antd'
import { getCommonSelectOptions } from '@/components/Common/crud'
import type { SelectProps } from 'antd/es/select'

export enum EAsyncCode {
  'datasourceType' = 'datasourceType',
  'datasourceId' = 'datasourceId',
  'datasourceDb' = 'datasourceDb',
}
export interface ISelectProps extends SelectProps {
  asyncCode: EAsyncCode
  asyncParams?: any
  optionFormatter?: (option: any) => any
}
export default (props: ISelectProps) => {
  const { asyncCode, asyncParams, optionFormatter = (option) => option, ...remainProps } = props
  const [options, setOptions] = useState<any>([])

  useEffect(() => {
    ~(async () => {
      const options = await getCommonSelectOptions(asyncCode, asyncParams)

      setOptions(optionFormatter(options))
    })()
  }, [asyncCode, asyncParams && JSON.stringify(asyncParams)])

  return (
    <Select {...remainProps} options={options}>
      {props.children}
    </Select>
  )
}
