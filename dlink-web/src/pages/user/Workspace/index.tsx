import PageWrap from '@/components/Common/PageWrap'
import WorkspaceTable from './WorkspaceTable'
import Summary from './Summary'
const Workspace = () => {
  const tabs = [
    {
      label: `概览`,
      key: 'summary',
      children: <Summary />,
    },
    {
      label: `空间管理`,
      key: 'workspace',
      children: <WorkspaceTable />,
    },
  ]

  return <PageWrap tabs={tabs}></PageWrap>
}

export default Workspace
