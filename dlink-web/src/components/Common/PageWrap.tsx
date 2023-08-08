import { PageContainer } from '@ant-design/pro-layout'
import { Scrollbars } from 'react-custom-scrollbars'
import { Tabs, Card, Col, Form, Row } from 'antd'

const navHeaderHeight = 48 //顶部header高度
const pageHeaderHeight = 50 //页面标题栏(面包屑)高度
const marginHeight = 48 // 上下margin相加空白高度
const tabsHeaderHeight = 46 // tab的标题栏高度

export default (props) => {
  const { noScroll, height, backgroundColor, tabs, tabsProps = {}, ...otherProps } = props
  const getContent = () => {
    // 传入tabs时为页签page
    if (tabs && tabs.length) {
      return (
        <Tabs
          style={{ height: '100%', padding: '0 10px' }}
          items={tabs.map((item) => ({
            label: item.label,
            key: item.key,
            children: (
              <div
                style={{
                  height: '100%',
                  margin: 0,
                  marginLeft: -10,
                  marginRight: -10,
                }}
              >
                <Scrollbars style={{ height: getTabContentHeight() }}>
                  <div style={{ padding: 10 }}>{item.children}</div>
                </Scrollbars>
              </div>
            ),
          }))}
          {...tabsProps}
        />
      )
    }
    // 传入noscroll时 不包裹scroll
    if (noScroll) {
      return props.children
    }
    return (
      <Scrollbars style={{ height: '100%' }}>
        <div style={{ padding: 10 }}>{props.children}</div>
      </Scrollbars>
    )
  }
  // page的高度
  const getPageHeight = () => {
    const { pageHeaderRender, height } = otherProps

    return (
      height ||
      `calc(100vh - ${
        navHeaderHeight + marginHeight + (pageHeaderRender === false ? 0 : pageHeaderHeight)
      }px)`
    )
  }
  const getTabContentHeight = () => {
    const { pageHeaderRender } = otherProps

    return `calc(100vh - ${
      navHeaderHeight +
      marginHeight +
      (pageHeaderRender === false ? 0 : pageHeaderHeight) +
      tabsHeaderHeight
    }px)`
  }
  return (
    <PageContainer title={false} {...otherProps}>
      <div
        style={{
          height: getPageHeight(),
          width: '100%',
          backgroundColor: backgroundColor || '#fff',
        }}
      >
        {getContent()}
      </div>
    </PageContainer>
  )
}
