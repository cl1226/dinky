import { PageContainer } from '@ant-design/pro-layout'
import { Scrollbars } from 'react-custom-scrollbars'
import { Tabs, Card, Col, Form, Row } from 'antd'

export default (props) => {
  const { noScroll, height, backgroundColor, tabs, tabsProps = {}, ...otherProps } = props
  const getContent = () => {
    if (tabs && tabs.length) {
      return (
        <Tabs
          items={tabs.map((item) => ({
            label: item.label,
            key: item.key,
            children: (
              <div
                style={{
                  height: 'calc(100vh - 48px - 50px - 48px - 46px)',
                  margin: 0,
                  marginLeft: -10,
                  marginRight: -10,
                }}
              >
                <Scrollbars style={{ height: '100%' }}>
                  <div style={{ padding: 10 }}>{item.children}</div>
                </Scrollbars>
              </div>
            ),
          }))}
          {...tabsProps}
        />
      )
    }
    if (noScroll) {
      return <div style={{ padding: 10 }}>{props.children}</div>
    }
    return (
      <Scrollbars style={{ height: '100%' }}>
        <div style={{ padding: 10 }}>{props.children}</div>
      </Scrollbars>
    )
  }
  return (
    <PageContainer title={false} {...otherProps}>
      <div
        style={{
          height:
            height ||
            `calc(100vh - 48px ${otherProps.pageHeaderRender === false ? '' : '- 50px '}- 48px)`,
          width: '100%',
          backgroundColor: backgroundColor || '#fff',
          padding: tabs && tabs.length ? '0 10px' : 0,
        }}
      >
        {getContent()}
      </div>
    </PageContainer>
  )
}
