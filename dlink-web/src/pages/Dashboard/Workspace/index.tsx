import PageWrap from '@/components/Common/PageWrap'
import WorkspaceTable from './WorkspaceTable'
import Summary from './Summary'
import Client from './Client'
import { connect, useModel } from 'umi'
const Workspace = () => {
  const { initialState } = useModel('@@initialState')
  const { currentUser } = initialState || {}

  const getTabs = () => {
    const tabs = [
      {
        label: `概览`,
        key: 'summary',
        children: <Summary />,
      },
    ]

    const { roleList } = currentUser || {}
    if (roleList && roleList.some((item) => item.roleCode === 'ClusterAdmin')) {
      tabs.push(
        {
          label: `空间管理`,
          key: 'workspace',
          children: <WorkspaceTable />,
        },
        {
          label: `客户端管理`,
          key: 'client',
          children: <Client />,
        },
      )
    }
    return tabs
  }

  return <PageWrap pageHeaderRender={false} tabs={getTabs()}></PageWrap>
}

export default Workspace
