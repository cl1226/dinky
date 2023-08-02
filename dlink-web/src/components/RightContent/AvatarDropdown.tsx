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

import React, { useCallback, useRef, useState } from 'react'
import {
  LogoutOutlined,
  SafetyOutlined,
  SecurityScanOutlined,
  SettingOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons'
import { Avatar, Menu, Modal, Spin } from 'antd'
import { handleOption } from '@/components/Common/crud'
import { history, useModel } from 'umi'
import { stringify } from 'querystring'
import HeaderDropdown from '../HeaderDropdown'
import styles from './index.less'
import { outLogin } from '@/services/ant-design-pro/api'
import { ActionType } from '@ant-design/pro-table'
import { l } from '@/utils/intl'
import PasswordForm from '@/pages/AuthenticationCenter/UserManager/components/PasswordForm'

export type GlobalHeaderRightProps = {
  menu?: boolean
}

/**
 * 退出登录，并且将当前的 url 保存
 */
const loginOut = async () => {
  await outLogin()
  const { query = {}, pathname } = history.location
  const { redirect } = query
  // Note: There may be security issues, please note
  if (window.location.pathname !== '/user/login' && !redirect) {
    history.replace({
      pathname: '/user/login',
      // search: stringify({
      //   redirect: pathname,
      // }),
    })
  }
}

const requestUrl = '/api/tenant/switchTenant'

const url = '/api/user'
const AvatarDropdown: React.FC<GlobalHeaderRightProps> = ({ menu }) => {
  const { initialState, setInitialState } = useModel('@@initialState')
  const actionRef = useRef<ActionType>()

  const [formValues, setFormValues] = useState({})
  const [passwordModalVisible, handlePasswordModalVisible] = useState<boolean>(false)

  const onMenuClick = useCallback(
    (event: {
      key: React.Key
      keyPath: React.Key[]
      item: React.ReactInstance
      domEvent: React.MouseEvent<HTMLElement>
    }) => {
      const { key } = event
      if (key === 'logout' && initialState) {
        setInitialState({ ...initialState, currentUser: undefined })
        loginOut()
        return
      } else if (key === 'changePassWord') {
        handlePasswordModalVisible(true)
        setFormValues({ username: initialState?.currentUser?.username })
      } else {
      }
      // history.push(`/account/${key}`);
    },
    [initialState, setInitialState],
  )

  const loading = (
    <span className={`${styles.action} ${styles.account}`}>
      <Spin
        size="small"
        style={{
          marginLeft: 8,
          marginRight: 8,
        }}
      />
    </span>
  )

  if (!initialState) {
    return loading
  }

  const { currentUser } = initialState

  if (!currentUser || !currentUser.username) {
    return loading
  }

  const menuHeaderDropdown = (
    <Menu className={styles.menu} selectedKeys={[]} onClick={onMenuClick}>
      {menu && (
        <Menu.Item key="personSettings" disabled>
          <SettingOutlined />
          {l('menu.account.settings')}
        </Menu.Item>
      )}
      {menu && (
        <Menu.Item key="changePassWord">
          <SafetyOutlined />
          {l('menu.account.changePassword')}
        </Menu.Item>
      )}
      {menu && <Menu.Divider />}
      <Menu.Item key="logout">
        <LogoutOutlined />
        {l('menu.account.logout')}
      </Menu.Item>
    </Menu>
  )
  return (
    <div>
      <HeaderDropdown overlay={menuHeaderDropdown}>
        <span className={`${styles.action} ${styles.account}`}>
          <Avatar size="small" className={styles.avatar} src={currentUser.avatar} alt="avatar" />
          <span className={`${styles.name} anticon`}>{currentUser.username}</span>
        </span>
      </HeaderDropdown>
      {formValues && Object.keys(formValues).length ? (
        <PasswordForm
          onSubmit={async (value) => {
            const success = await handleOption(
              url + '/modifyPassword',
              l('button.changePassword'),
              value,
            )
            if (success) {
              handlePasswordModalVisible(false)
              setFormValues({})
            }
          }}
          onCancel={() => {
            handlePasswordModalVisible(false)
          }}
          modalVisible={passwordModalVisible}
          values={formValues}
        />
      ) : null}
    </div>
  )
}

export default AvatarDropdown
