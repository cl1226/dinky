import React, { useState } from 'react'
import { Button, Space, Input, Modal } from 'antd'
import { l } from '@/utils/intl'
import CatalogueTree from '@/pages/DataService/ApiDev/Catalogue/components/CatalogueTree'
type CatalogueValue = {
  id: number
  path: string
  [key: string]: any
}
export default (props) => {
  const { value, onChange, style, ...remainProps } = props
  const [visible, setVisible] = useState(false)
  const [currentCatalogue, setCurrentCatalogue] = useState<CatalogueValue | null>(value)
  const confirm = () => {
    onChange && onChange(currentCatalogue)
    setVisible(false)
  }
  const getCurrentCatalogue = (catalogue) => {
    setCurrentCatalogue({
      id: catalogue.id,
      path: catalogue?.path?.join('/'),
    })
  }

  const renderFooter = () => {
    return (
      <>
        <Button
          onClick={() => {
            setVisible(false)
            setCurrentCatalogue(null)
          }}
        >
          {l('button.cancel')}
        </Button>
        <Button type="primary" onClick={() => confirm()}>
          {l('button.finish')}
        </Button>
      </>
    )
  }

  return (
    <>
      <Space.Compact style={style}>
        <Input readOnly value={value?.path} onChange={onChange} {...remainProps} />
        <Button
          onClick={() => {
            setVisible(true)
          }}
        >
          选择目录
        </Button>
      </Space.Compact>

      <Modal
        width={640}
        bodyStyle={{ padding: '32px 40px 48px' }}
        destroyOnClose
        title={'选择目录'}
        open={visible}
        footer={renderFooter()}
        onCancel={() => {
          setVisible(false)
          setCurrentCatalogue(null)
        }}
      >
        <div style={{}}>选中路径：{currentCatalogue?.path}</div>
        <CatalogueTree simple={true} getCurrentCatalogue={getCurrentCatalogue}></CatalogueTree>
      </Modal>
    </>
  )
}
