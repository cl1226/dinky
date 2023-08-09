import { PageContainer } from '@ant-design/pro-layout'
import { Button, message, Row } from 'antd'
import { useEffect, useRef, useState } from 'react'
import MonacoEditor from 'react-monaco-editor'
import { useParams, history } from 'umi'
import { addFile, showDetail, IAddFileParams } from '../service'

interface Detail {
  filename: string
  content: string
  catalogueId: number
}

export default ({ readOnly = true }) => {
  const [detail, setdetail] = useState<Detail>()
  const params: { id: string } = useParams()
  const monaco = useRef<any>()

  const getDetail = () => {
    showDetail(Number(params.id)).then((res) => {
      const { code, datas } = res
      if (code == 0) {
        setdetail(datas)
      } else {
        message.error('获取文件信息失败')
      }
    })
  }

  const update = () => {
    const str = monaco.current.editor.getModel().getValue()
    if (str.length == 0) {
      message.error('请输入文件内容')
      return
    }
    addFile({
      id: Number(params.id),
      type: 'File',
      ...(detail || {}),
      str,
      uploadType: 'create',
    })
      .then((res) => {
        const { code, datas } = res
        if (code == 0) {
          message.success('保存成功')
          history.push('/resource/resourcemanage/document')
        } else {
          throw new Error('保存失败')
        }
      })
      .catch((err) => {
        message.error(err.message || err)
      })
  }

  useEffect(() => {
    getDetail()
  }, [])

  return (
    <PageContainer title="文件详情">
      <div style={{ backgroundColor: 'white' }}>
        <h2 style={{ height: 60, textAlign: 'center', lineHeight: 1, padding: 20 }}>
          {detail?.filename}
        </h2>
        <MonacoEditor
          ref={monaco}
          height={`calc(100vh - 48px - 98px - 45px - 24px - 12px - 70px)`}
          theme="vs"
          language="java"
          options={{
            automaticLayout: true,
            selectOnLineNumbers: true,
            readOnly: readOnly,
          }}
          value={detail?.content}
        />
        <Row>
          <Button
            type="link"
            key="back"
            onClick={() => {
              history.goBack()
            }}
          >
            返回
          </Button>
          {!readOnly && (
            <Button type="link" key="save" onClick={update}>
              保存
            </Button>
          )}
        </Row>
      </div>
    </PageContainer>
  )
}
