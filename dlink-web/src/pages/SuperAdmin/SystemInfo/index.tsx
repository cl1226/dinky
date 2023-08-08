import PageWrap from '@/components/Common/PageWrap'
import React, { useEffect, useState } from 'react'
import { getRootLog } from '@/pages/SuperAdmin/SystemInfo/service'
import CodeShow from '@/components/Common/CodeShow'

const SystemInfo = () => {
  const [log, setLog] = useState<string>('Nothing.')

  useEffect(() => {
    refreshRootLog()
  }, [])

  const refreshRootLog = () => {
    const res = getRootLog()
    res.then((result) => {
      result.datas && setLog(result.datas)
    })
  }

  const getTabs = () => {
    const tabs = [
      {
        label: `Logs`,
        key: 'logs',
        children: <CodeShow code={log} language="java" height="70vh" />,
      },
    ]

    return tabs
  }

  return <PageWrap tabs={getTabs()}></PageWrap>
}

export default SystemInfo
