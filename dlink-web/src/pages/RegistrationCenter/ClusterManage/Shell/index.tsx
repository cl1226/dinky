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
import { Button, Drawer, Input, message, Modal } from 'antd'
import React, { useRef, useState } from 'react'
import { PageContainer } from '@ant-design/pro-layout'
import type { ActionType, ProColumns } from '@ant-design/pro-table'
import ProTable from '@ant-design/pro-table'
import ProDescriptions from '@ant-design/pro-descriptions'
import type { ShellTableListItem } from '@/pages/RegistrationCenter/data'

import { handleAddOrUpdate, handleRemove, queryData } from '@/components/Common/crud'
import ShellForm from '@/pages/RegistrationCenter/ClusterManage/Shell/components/ShellForm'
import { l } from '@/utils/intl'

const TextArea = Input.TextArea
const url = '/api/cluster'

const ClusterTableList: React.FC<{}> = (props: any) => {
  const { dispatch } = props
  const [modalVisible, handleModalVisible] = useState<boolean>(false)
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false)
  const [formValues, setFormValues] = useState({})
  const actionRef = useRef<ActionType>()
  const [row, setRow] = useState<ShellTableListItem>()

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
      title: l('pages.rc.cluster.instanceName'),
      dataIndex: 'name',
      render: (dom, entity) => {
        return <a onClick={() => setRow(entity)}>{dom}</a>
      },
    },
    {
      title: l('pages.rc.cluster.instanceId'),
      dataIndex: 'id',
      hideInTable: true,
      hideInForm: true,
      hideInSearch: true,
    },
    {
      title: l('pages.rc.cluster.alias'),
      sorter: true,
      dataIndex: 'alias',
      hideInTable: false,
    },
    {
      title: l('pages.rc.cluster.jobManagerHaAddress'),
      sorter: true,
      dataIndex: 'hosts',
      valueType: 'textarea',
      hideInForm: false,
      hideInSearch: true,
      hideInTable: true,
    },
    {
      title: l('pages.rc.cluster.resourceManagerAddr'),
      sorter: true,
      valueType: 'textarea',
      dataIndex: 'resourceManagerAddr',
      hideInForm: true,
      hideInSearch: true,
      hideInTable: false,
    },
    {
      title: l('pages.rc.cluster.applicationId'),
      sorter: true,
      valueType: 'textarea',
      dataIndex: 'applicationId',
      hideInForm: true,
      hideInSearch: true,
      hideInTable: false,
    },
    {
      title: l('global.table.note'),
      sorter: true,
      valueType: 'textarea',
      dataIndex: 'note',
      hideInForm: false,
      hideInSearch: true,
      hideInTable: true,
    },
    {
      title: l('global.table.createTime'),
      dataIndex: 'createTime',
      sorter: true,
      valueType: 'dateTime',
      hideInForm: true,
      hideInTable: true,
      renderFormItem: (item, { defaultRender, ...rest }, form) => {
        const status = form.getFieldValue('status')
        if (`${status}` === '0') {
          return false
        }
        if (`${status}` === '3') {
          return <Input {...rest} placeholder="请输入异常原因！" />
        }
        return defaultRender(item)
      },
    },
    {
      title: l('global.table.operate'),
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        <a
          onClick={() => {
            handleUpdateModalVisible(true)
            setFormValues(record)
          }}
        >
          {l('button.config')}
        </a>,

        <a
          onClick={() => {
            onDelete(record)
          }}
        >
          {l('button.delete')}
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
            <PlusOutlined /> {l('button.create')}
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

      <Drawer
        width={600}
        visible={!!row}
        onClose={() => {
          setRow(undefined)
        }}
        closable={false}
      >
        {row?.name && (
          <ProDescriptions<ShellTableListItem>
            column={2}
            title={row?.name}
            request={async () => ({
              data: row || {},
            })}
            params={{
              id: row?.name,
            }}
            columns={columns}
          />
        )}
      </Drawer>
    </PageContainer>
  )
}

export default ClusterTableList
