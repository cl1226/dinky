import { Col, Divider, Row } from 'antd'
import { useEffect } from 'react'

export default () => {
  useEffect(() => {
    console.log('mount');
    
    return () => {
      console.log('unmount');
      
    }
  }, [])
  return (
    <Row>
      <Col span="8">1</Col>
      <Col span="1">
        <Divider type="vertical" dashed />
      </Col>
      <Col span="15">2</Col>
    </Row>
  )
}
