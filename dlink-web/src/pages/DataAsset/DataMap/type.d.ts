export const ITEMTYPE = {
  Column: 'Column',
  Database: 'Database',
  Table: 'Table',
}

export const DBTYPE = {
  Hive: 'Hive',
  StarRocks: 'StarRocks',
  Mysql: 'Mysql',
}

export interface IAssetDetail {
  /**db */
  attributes?: string
  createTime?: string
  datasourceId: number
  datasourceName: string
  datasourceType: DBTYPE
  description?: string
  id: number
  label?: string
  labelName?: string
  metadataTableDTOS?: IAssetDetail[]
  name?: string
  position?: string
  type: ITEMTYPE
  updateTime?: string

  /**table */
  metadataColumnDTOS: IAssetDetail[]
  tableType?: string
  dbId?: number
  dbName?: string
  metadataColumnLineages?: any
  metadataTableLineages?: any

  /**column */
  autoIncrement?: boolean
  characterSet?: string
  collationStr?: string
  columnFamily?: string
  columnType?: string
  defaultValue?: string
  keyFlag?: boolean
  length?: number
  nullable?: boolean
  partitionFlag?: boolean
  precisionLength?: number
  scale?: number
  tableId?: number
  tableName?: string

  tabKey?: string
}
