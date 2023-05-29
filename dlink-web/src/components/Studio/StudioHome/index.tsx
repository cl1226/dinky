/*
 *
 *  Licensed to the Apache Software Foundation (ASF) under one or more
 *  contributor license agreements.  See the NOTICE file distributed with
 *  this work for additional information regarding copyright ownership.
 *  The ASF licenses this file to You under the Apache License, Version 2.0
 *  (the "License"); you may not use this file except in compliance with
 *  the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

import { List, Avatar, Row, Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { history } from 'umi'

const StudioHome = (props: any) => {
  const list = [{
    name: '新建脚本',
    imageUrl: '/schedule/develop.png',
    description: '对脚本进行在线开发、调试和执行，开发完成的脚本也可以在作业中执行',
    type: '新建脚本',
    url: '/dataDev/develop/dataStudio'
  }, {
    name: '新建作业',
    imageUrl: '/schedule/workflow.png',
    description: '拖拽所需节点至画布中，连接节点，轻松实现作业开发',
    type: '新建作业',
    url: '/dataDev/develop/scheduler'
  }, {
    name: '新建数据连接',
    imageUrl: '/schedule/project.png',
    description: '通过配置数据源信息、建立数据连接，配置的数据连接会在脚本和作业的开发过程中用到，用于访问数据源',
    type: '新建数据连接',
    url: '/registration/database'
  }]

  return (
    <List
      className="demo-loadmore-list"
      itemLayout="horizontal"
      size={"large"}
      dataSource={list}
      renderItem={(item) => (
        <List.Item style={{height: '150px'}}>
          <List.Item.Meta
            avatar={<Avatar shape="square" style={{'width': '100px', 'height': '100px'}} src={item.imageUrl} />}
            title={item.name}
            description={item.description}
          />
          <Row>
            <Button icon={<PlusOutlined />}
            onClick={() => {
              history.push(item.url)
            }}
            >{item.type}</Button>
          </Row>
        </List.Item>
      )}
    />
  )
};

export default StudioHome
