import React, { useState, useEffect } from 'react'
import styles from './index.less'
import PageWrap from '@/components/Common/PageWrap'
import { Row, Card, Collapse, Button } from 'antd'

const cardGridStyle: React.CSSProperties = {}

const CollapseDetail = (props) => {
  const { panels } = props
  const onChange = (key: string | string[]) => {
    console.log(key)
  }

  const getExtra = (panelItem) => {
    return (
      <>
        <span style={{ marginLeft: 15 }}>
          <span>类型</span>
          <span style={{ marginLeft: 5 }}>dws</span>
        </span>

        <span style={{ marginLeft: 15 }}>
          <span>库</span>
          <span style={{ marginLeft: 5 }}>4</span>
        </span>

        <span style={{ marginLeft: 15 }}>
          <span>表</span>
          <span style={{ marginLeft: 5 }}>219</span>
        </span>

        <span style={{ marginLeft: 15 }}>
          <span>数据量</span>
          <span style={{ marginLeft: 5 }}>2.19 GB</span>
        </span>
      </>
    )
  }

  return panels && panels.length ? (
    <Collapse onChange={onChange} style={{ width: '100%' }}>
      {panels.map((panel) => (
        <Collapse.Panel
          header={<a className={styles['link-title']}>{panel.name}</a>}
          key="1"
          extra={getExtra(panel)}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            <Card.Grid className={styles['grid-box']}>
              <div className="grid-title">gaussdb.public</div>
              <div className="grid-info">
                <span style={{ marginRight: 10 }}>
                  <span style={{ marginRight: 3 }}>表</span>
                  <span>0</span>
                </span>
                <span>
                  <span style={{ marginRight: 3 }}>数据量</span>
                  <span>0.00 Bytes</span>
                </span>
              </div>
            </Card.Grid>
          </div>
        </Collapse.Panel>
      ))}
    </Collapse>
  ) : null
}
const DataMapOverview = () => {
  const onCardClick = () => {}

  const tabs = [
    {
      label: `资产总览`,
      key: 'summary',
      children: (
        <>
          <Row>
            <Card className={styles['overview-card']} hoverable={true} onClick={onCardClick}>
              <div style={{ display: 'flex', justifyContent: 'flex-start', minWidth: 360 }}>
                <div className="img-box">
                  <img src="/dataAsset/dataMap/type2.png" alt="" />
                </div>
                <div className="info-box">
                  <div className="info-title">技术资产</div>
                  <div className="info-item">
                    <div className="info-text">数据库</div>
                    <div className="info-value">30</div>
                    <div className="info-text">个</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">数据表</div>
                    <div className="info-value">30</div>
                    <div className="info-text">张</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">数据量</div>
                    <div className="info-value">44</div>
                    <div className="info-text">GB</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* <Card className={styles['overview-card']} hoverable={true} onClick={onCardClick}>
              <div style={{ display: 'flex', justifyContent: 'flex-start', minWidth: 360 }}>
                <div className="img-box">
                  <img src="/dataAsset/dataMap/type1.png" alt="" />
                </div>
                <div className="info-box">
                  <div className="info-title">业务资产</div>
                  <div className="info-item">
                    <div className="info-text">业务对象</div>
                    <div className="info-value">30</div>
                    <div className="info-text">个</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">逻辑实体</div>
                    <div className="info-value">30</div>
                    <div className="info-text">个</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">业务属性</div>
                    <div className="info-value">44</div>
                    <div className="info-text">个</div>
                  </div>
                </div>
              </div>
            </Card> */}
          </Row>
          <Row style={{ marginTop: 30 }}>
            <CollapseDetail
              panels={[
                {
                  name: 'xxxx',
                },
              ]}
            ></CollapseDetail>
          </Row>
        </>
      ),
    },
  ]
  return <PageWrap tabs={tabs}></PageWrap>
}

export default DataMapOverview
