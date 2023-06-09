import { PageContainer } from '@ant-design/pro-layout'
import { Scrollbars } from 'react-custom-scrollbars'

export default (props) => {
  const { noScroll, height, backgroundColor, ...otherProps } = props
  return (
    <PageContainer title={false} {...otherProps}>
      <div
        style={{
          height: height || 'calc(100vh - 48px - 50px - 48px)',
          width: '100%',
          backgroundColor: backgroundColor || '#fff',
        }}
      >
        {noScroll ? (
          <div style={{ padding: 10 }}>{props.children}</div>
        ) : (
          <Scrollbars style={{ height: '100%' }}>
            <div style={{ padding: 10 }}>{props.children}</div>
          </Scrollbars>
        )}
      </div>
    </PageContainer>
  )
}
