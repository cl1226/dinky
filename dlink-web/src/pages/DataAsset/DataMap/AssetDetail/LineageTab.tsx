import { useEffect, useMemo, useState } from 'react'
import styles from './index.less'
import { IAssetDetail } from '@/pages/DataAsset/DataMap/type.d'
import { Table, Empty, Spin } from 'antd'
import Lineage, { getInit } from '@/components/Lineage'
import { useParams } from 'umi'

const getLineages = (tableOrg, colOrg) => {
  const relations: any = []
  const tableMaps = {}
  tableOrg.forEach((item) => {
    if (!tableMaps[item.originTableId]) {
      tableMaps[item.originTableId] = {
        id: item.originTableId + '',
        name: item.originDatasourceName + '.' + item.originTableName,
        columns: {},
      }
    }

    if (!tableMaps[item.targetTableId]) {
      tableMaps[item.targetTableId] = {
        id: item.targetTableId + '',
        name: item.targetDatasourceName + '.' + item.targetTableName,
        columns: {},
      }
    }
  })
  colOrg.forEach((item) => {
    relations.push({
      id: item.id + '',
      srcTableColName: item.originColumnName,
      srcTableId: item.originTableId + '',
      tgtTableColName: item.targetColumnName,
      tgtTableId: item.targetTableId + '',
    })
    if (tableMaps[item.originTableId]) {
      tableMaps[item.originTableId]['columns'][item.originColumnName] = item.originColumnName
    }
    if (tableMaps[item.targetTableId]) {
      tableMaps[item.targetTableId]['columns'][item.targetColumnName] = item.targetColumnName
    }
  })

  return {
    relations,
    tables: Object.values(tableMaps).map((item: any) => {
      return {
        ...item,
        columns: Object.keys(item.columns).map((jtem) => ({ name: jtem, title: jtem })),
      }
    }),
  }
}

const LineageTab = (props) => {
  const { basicInfo, currentKey }: { basicInfo: IAssetDetail; currentKey: string } = props
  const [lineages, setLineages] = useState<any>(getInit())

  useEffect(() => {
    if (currentKey === `${basicInfo.type}/${basicInfo.id}/lineage`) {
      const { metadataColumnLineages, metadataTableLineages } = basicInfo
      setLineages(getLineages(metadataTableLineages, metadataColumnLineages))
    } else {
      setLineages(getInit())
    }
  }, [currentKey])

  return (
    <div className={styles['detail-tab-wrap']}>
      {lineages.tables && lineages.tables.length ? <Lineage datas={lineages} /> : <Empty />}
    </div>
  )
}

export default LineageTab
