import { useEffect, useState } from 'react'
import styles from './index.less'
import { IAssetDetail } from '@/pages/DataAsset/DataMap/type.d'
import { Table, Empty, Spin } from 'antd'

const LineageTab = (props) => {
  const { basicInfo }: { basicInfo: IAssetDetail } = props

  return <div className={styles['detail-tab-wrap']}>1111</div>
}

export default LineageTab
