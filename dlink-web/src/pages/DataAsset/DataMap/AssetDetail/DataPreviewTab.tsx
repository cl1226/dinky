import { useEffect, useState } from 'react'
import styles from './index.less'
import { IAssetDetail } from '@/pages/DataAsset/DataMap/type.d'
import { Table, Empty, Spin } from 'antd'
import { getDataPreview } from '@/pages/DataAsset/DataMap/service'

const DataPreviewTab = (props) => {
  const { basicInfo }: { basicInfo: IAssetDetail } = props
  const [loading, setLoading] = useState(false)
  const [empty, setEmpty] = useState(true)
  const [columns, setColumns] = useState<any>([])
  const [dataSource, setDataSource] = useState<any>([])
  const getPreviewList = async () => {
    setLoading(true)
    const result = await getDataPreview(basicInfo.id)
    setLoading(false)
    if (result) {
      setEmpty(false)
      const { columns, rowData } = result
      setColumns(
        columns.map((item) => ({
          title: item,
          dataIndex: item,
          key: item,
        })),
      )
      setDataSource(rowData)
    } else {
      setEmpty(true)
    }
  }
  useEffect(() => {
    getPreviewList()
  }, [])
  return (
    <Spin spinning={loading}>
      <div className={styles['detail-tab-wrap']}>
        {empty ? (
          <Empty />
        ) : (
          <Table
            rowKey="id"
            size="small"
            columns={columns}
            dataSource={dataSource}
            pagination={{
              showTotal: (total) => `共 ${total} 条`,
              showSizeChanger: true,
              showQuickJumper: true,
            }}
          />
        )}
      </div>
    </Spin>
  )
}
export default DataPreviewTab
