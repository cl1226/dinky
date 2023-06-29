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
import { Button, Input, message, Modal } from 'antd'
import React, { useRef, useState } from 'react'
import { PageContainer } from '@ant-design/pro-layout'
import type { ActionType, ProColumns } from '@ant-design/pro-table'
import ProTable from '@ant-design/pro-table'
import type { ShellTableListItem } from '@/pages/RegistrationCenter/data'

import { handleAddOrUpdate, handleRemove, queryData } from '@/components/Common/crud'
import ShellForm from '@/pages/RegistrationCenter/ClusterManage/Shell/components/ShellForm'

const url = '/api/cluster'

const ShellTableList: React.FC<{}> = (props: any) => {
  const { dispatch } = props
  const [modalVisible, handleModalVisible] = useState<boolean>(false)
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false)
  const [formValues, setFormValues] = useState({})
  const actionRef = useRef<ActionType>()

  const onDelete = (currentItem: ShellTableListItem) => {
    Modal.confirm({
      content: '确定删除该环境配置吗？',
      onOk: async () => {
        await handleRemove(url, [currentItem])
        actionRef.current?.reloadAndRest?.()
      },
    })
  }

  const columns: ProColumns<ShellTableListItem>[] = [
    {
      title: '名称',
      dataIndex: 'name',
      width: 240,
    },
    {
      title: 'hostName',
      dataIndex: 'hostName',
      width: 150,
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
      title: '密码',
      dataIndex: 'password',
      hideInSearch: true,
      width: 150,
    },
    {
      title: '描述',
      dataIndex: 'description',
      valueType: 'textarea',
      hideInSearch: true,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      width: 200,
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

  return (
    <PageContainer title={false}>
      <ProTable<ShellTableListItem>
        size="small"
        headerTitle={'环境管理'}
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button type="primary" onClick={() => handleModalVisible(true)}>
            <PlusOutlined /> 新建
          </Button>,
        ]}
        request={(params, sorter, filter) => queryData(url, { ...params, sorter, filter })}
        columns={columns}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
      />
      <ShellForm
        onSubmit={async (value) => {
          const success = await handleAddOrUpdate(url, value)
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
      ></ShellForm>
      {formValues && Object.keys(formValues).length ? (
        <ShellForm
          onSubmit={async (value) => {
            const success = await handleAddOrUpdate(url, value)
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
    </PageContainer>
  )
}

export default ShellTableList
