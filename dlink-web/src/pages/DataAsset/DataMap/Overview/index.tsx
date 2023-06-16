import React, { useState, useEffect } from 'react'
import styles from './index.less'
import PageWrap from '@/components/Common/PageWrap'
import { Row, Card, Collapse, Button } from 'antd'
import { getStatistics, getStatisticsDetail } from '@/pages/DataAsset/DataMap/service'
import { transferByteSize } from '@/utils/utils'
import { history, connect } from 'umi'

const CollapseDetail = (props) => {
  const { panels, dispatch } = props

  const getExtra = (panelItem) => {
    return (
      <>
        <span style={{ marginLeft: 15 }}>
          <span>类型</span>
          <span style={{ marginLeft: 5 }}>{panelItem.datasourceType}</span>
        </span>

        <span style={{ marginLeft: 15 }}>
          <span>库</span>
          <span style={{ marginLeft: 5 }}>{panelItem.dbNum}</span>
        </span>

        <span style={{ marginLeft: 15 }}>
          <span>表</span>
          <span style={{ marginLeft: 5 }}>{panelItem.tableNum}</span>
        </span>

        <span style={{ marginLeft: 15 }}>
          <span>数据量</span>
          <span style={{ marginLeft: 5 }}>{`${transferByteSize(panelItem.dataVol)[0]} ${
            transferByteSize(panelItem.dataVol)[1]
          }`}</span>
        </span>
      </>
    )
  }

  const listPageJump = (query) => {
    dispatch({
      type: 'DataAssetMap/saveFilterForm',
      payload: {
        datasourceType: query.datasourceType,
        itemType: query.itemType || ['Table'],
      },
    })

    history.push('/dataAsset/dataMap/dataDirectory')
  }
  return panels && panels.length ? (
    <Collapse style={{ width: '100%' }}>
      {panels.map((panel, index) => (
        <Collapse.Panel
          header={
            <a
              className={styles['link-title']}
              onClick={() => {
                listPageJump({ datasourceType: [panel.datasourceType] })
              }}
            >
              {panel.datasourceName}
            </a>
          }
          key={index}
          extra={getExtra(panel)}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {panel.dbs.map((db) => (
              <Card.Grid className={styles['grid-box']}>
                <span
                  className="grid-title"
                  onClick={() => {
                    listPageJump({ datasourceType: [panel.datasourceType], itemType: ['Database'] })
                  }}
                >
                  {db.name}
                </span>
                <div className="grid-info">
                  <span style={{ marginRight: 10 }}>
                    <span style={{ marginRight: 3 }}>表</span>
                    <span>{db.tableNum}</span>
                  </span>
                  <span>
                    <span style={{ marginRight: 3 }}>数据量</span>
                    <span>{`${transferByteSize(db.dataVol)[0]} ${
                      transferByteSize(db.dataVol)[1]
                    }`}</span>
                  </span>
                </div>
              </Card.Grid>
            ))}
          </div>
        </Collapse.Panel>
      ))}
    </Collapse>
  ) : null
}
const DataMapOverview = (props) => {
  const [statisticsList, setStatisticsList] = useState<any>([])
  const [visible, setVisible] = useState(false)
  const [panels, setPanels] = useState<any>([])
  const onCardClick = async (item) => {
    if (visible) {
      setVisible(false)
    } else {
      const result = await getStatisticsDetail(item.type)
      setPanels(result)
      setVisible(true)
    }
  }

  useEffect(() => {
    ~(async () => {
      const result = await getStatistics()
      setStatisticsList(result)
    })()
  }, [])
  const tabs = [
    {
      label: `资产总览`,
      key: 'summary',
      children: (
        <>
          <Row>
            {statisticsList.map((item) => (
              <Card
                className={styles['overview-card']}
                hoverable={true}
                onClick={() => onCardClick(item)}
              >
                <div style={{ display: 'flex', justifyContent: 'flex-start', minWidth: 360 }}>
                  <div className="img-box">
                    <img src="/dataAsset/dataMap/type2.png" alt="" />
                  </div>
                  <div className="info-box">
                    <div className="info-title">{item.title}</div>
                    <div className="info-item">
                      <div className="info-text">数据库</div>
                      <div className="info-value">{item.dbNum}</div>
                      <div className="info-text">个</div>
                    </div>
                    <div className="info-item">
                      <div className="info-label">数据表</div>
                      <div className="info-value">{item.tableNum}</div>
                      <div className="info-text">个</div>
                    </div>
                    <div className="info-item">
                      <div className="info-label">数据量</div>
                      <div className="info-value">{item.dataVol}</div>
                      <div className="info-text">{item.dataUnit}</div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </Row>
          {visible && (
            <Row style={{ marginTop: 30 }}>
              <CollapseDetail panels={panels} dispatch={props.dispatch}></CollapseDetail>
            </Row>
          )}
        </>
      ),
    },
  ]
  return <PageWrap tabs={tabs}></PageWrap>
}

export default connect(() => ({}))(DataMapOverview)
