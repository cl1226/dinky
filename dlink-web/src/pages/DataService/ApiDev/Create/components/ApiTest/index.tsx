import React from 'react'
import styles from './index.less'
import { Descriptions } from 'antd'
export default ({ form, formLayout, forms }) => {
  return (
    <div className={styles['api-test']}>
      <div className="left-part">
        <Descriptions column={1} title={false} layout="horizontal">
          <Descriptions.Item label="API 名称">Zhou Maomao</Descriptions.Item>
          <Descriptions.Item label="请求Path">1810000000</Descriptions.Item>
        </Descriptions>
      </div>
      <div className="right-part">111</div>
    </div>
  )
}
