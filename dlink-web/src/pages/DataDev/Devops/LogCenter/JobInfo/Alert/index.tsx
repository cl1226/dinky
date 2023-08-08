import { Typography } from 'antd'
import ProTable, { ProColumns } from '@ant-design/pro-table'
import { queryData } from '@/components/Common/crud'
import { l } from '@/utils/intl'

const { Text } = Typography
type AlertHistoryTableListItem = {
  title: string
  content: string
  status: number
  log: string
  createTime: string
}

const Alert = (props: any) => {
  const url = '/api/alertGroup'
  const { job } = props

  const columns: ProColumns<AlertHistoryTableListItem>[] = [
    {
      title: l('pages.devops.jobinfo.alert.title'),
      dataIndex: 'title',
      render: (dom, entity) => {
        return (
          <Text style={{ width: 200 }} ellipsis={{ tooltip: entity.title }}>
            {entity.title}
          </Text>
        )
      },
    },
    {
      title: l('pages.devops.jobinfo.alert.content'),
      dataIndex: 'content',
      render: (dom, entity) => {
        return (
          <Text style={{ width: 500 }} ellipsis={{ tooltip: entity.content }}>
            {entity.content}
          </Text>
        )
      },
    },
    {
      title: l('pages.devops.jobinfo.alert.status'),
      dataIndex: 'status',
      sorter: true,
      render: (dom, entity) => {
        return entity.status === 1 ? (
          <Text type="success">{l('pages.devops.jobinfo.alert.status.success')}</Text>
        ) : (
          <Text type="danger">{l('pages.devops.jobinfo.alert.status.failed')}</Text>
        )
      },
    },
    {
      title: l('pages.devops.jobinfo.alert.log'),
      dataIndex: 'log',
      render: (dom, entity) => {
        return (
          <Text style={{ width: 500 }} ellipsis={{ tooltip: entity.log }}>
            {entity.log}
          </Text>
        )
      },
    },
    {
      title: l('pages.devops.jobinfo.alert.createTime'),
      dataIndex: 'createTime',
      valueType: 'dateTime',
    },
  ]

  return (
    <>
      <ProTable
        columns={columns}
        style={{ width: '100%' }}
        request={(params, sorter, filter) =>
          queryData(url + '/history', {
            ...params,
            jobInstanceId: job.instance?.id,
            sorter,
            filter,
          } as any)
        }
        rowKey="name"
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
        toolBarRender={false}
        search={false}
        size="small"
      />
    </>
  )
}

export default Alert
