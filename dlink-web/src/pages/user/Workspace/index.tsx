import PageWrap from '@/components/Common/PageWrap'

const Workspace = () => {
  const tabs = [
    {
      label: `概览`,
      key: 'summary',
      children: <>11111</>,
    },
  ]

  return <PageWrap tabs={tabs}></PageWrap>
}

export default Workspace
