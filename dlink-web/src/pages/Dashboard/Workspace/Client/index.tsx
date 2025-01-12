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

import { PlusOutlined } from '@ant-design/icons'
import { Button, Tooltip, message, Modal } from 'antd'
import React, { useEffect, useRef, useState } from 'react'
import type { ActionType, ProColumns } from '@ant-design/pro-table'
import ProTable from '@ant-design/pro-table'

import ClientForm from '@/pages/Dashboard/Workspace/Client/components/ClientForm'

import { ClientTableListItem } from '@/pages/Dashboard/data.d'

import { getClientList, addorUpdateClient, deleteClient } from '@/pages/Dashboard/service'
import { getClusterByUser } from '@/pages/user/service'

const ShellTableList: React.FC<{}> = (props: any) => {
  const { dispatch } = props
  const [modalVisible, handleModalVisible] = useState<boolean>(false)
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false)
  const [formValues, setFormValues] = useState({})
  const actionRef = useRef<ActionType>()
  const [clusterMaps, setClusterMaps] = useState<any>({})
  const initClusterMaps = async () => {
    const result = await getClusterByUser()
    const tempMaps = {}
    result.forEach((item) => {
      tempMaps[item.id] = {
        text: item.name,
        status: item.id,
      }
    })
    setClusterMaps(tempMaps)
  }
  const onDelete = (currentItem: ClientTableListItem) => {
    Modal.confirm({
      content: '确定删除该客户端配置吗？',
      onOk: async () => {
        const result = await deleteClient(currentItem.id)
        result && actionRef.current?.reloadAndRest?.()
      },
    })
  }

  const columns: ProColumns<ClientTableListItem>[] = [
    {
      title: '名称',
      dataIndex: 'name',
      width: 240,
    },
    {
      title: '所属集群',
      dataIndex: 'clusterName',
      width: 240,
      valueType: 'select',
      valueEnum: clusterMaps,
    },
    {
      title: '所属集群ID',
      dataIndex: 'clusterId',
      hideInSearch: true,
      width: 150,
    },
    {
      title: 'hostname',
      dataIndex: 'hostname',
      width: 200,
    },
    {
      title: 'ip',
      dataIndex: 'ip',
      hideInSearch: true,
      width: 150,
    },
    {
      title: '端口',
      dataIndex: 'port',
      hideInSearch: true,
      width: 100,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      hideInSearch: true,
      width: 150,
    },
    {
      title: '环境变量',
      dataIndex: 'env',
      hideInSearch: true,
      width: 200,
      ellipsis: true,
    },
    {
      title: '描述',
      dataIndex: 'description',
      valueType: 'textarea',
      hideInSearch: true,
      width: 300,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      fixed: 'right',
      width: 150,
      render: (_, record) => [
        <a
          onClick={() => {
            handleUpdateModalVisible(true)
            setFormValues(record)
          }}
        >
          编辑
        </a>,

        <a
          onClick={() => {
            onDelete(record)
          }}
        >
          删除
        </a>,
      ],
    },
  ]

  useEffect(() => {
    initClusterMaps()
  }, [])
  return (
    <>
      <ProTable<ClientTableListItem>
        size="small"
        headerTitle={'客户端管理'}
        actionRef={actionRef}
        rowKey="id"
        scroll={{ x: 1200 }}
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button type="primary" onClick={() => handleModalVisible(true)}>
            <PlusOutlined /> 新建
          </Button>,
        ]}
        request={(params, sorter, filter) => {
          const { current, clusterName, ...resetParams } = params

          return getClientList({
            pageIndex: current,
            clusterName: clusterName ? clusterMaps[clusterName]?.text : '',
            ...resetParams,
          })
        }}
        columns={columns}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
      />
      <ClientForm
        onSubmit={async (value) => {
          const success = await addorUpdateClient(value)
          if (success) {
            handleModalVisible(false)
            setFormValues({})
            if (actionRef.current) {
              actionRef.current.reload()
            }
          }
        }}
        onCancel={() => handleModalVisible(false)}
        modalVisible={modalVisible}
        values={{}}
      ></ClientForm>
      {formValues && Object.keys(formValues).length ? (
        <ClientForm
          onSubmit={async (value) => {
            const success = await addorUpdateClient(value)
            if (success) {
              handleUpdateModalVisible(false)
              setFormValues({})
              if (actionRef.current) {
                actionRef.current.reload()
              }
            }
          }}
          onCancel={() => {
            handleUpdateModalVisible(false)
            setFormValues({})
          }}
          modalVisible={updateModalVisible}
          values={formValues}
        />
      ) : undefined}
    </>
  )
}

export default ShellTableList
