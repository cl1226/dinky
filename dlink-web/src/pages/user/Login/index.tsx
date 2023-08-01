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

import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { Button, message, Modal, Card, Avatar } from 'antd'
import React, { useEffect, useState } from 'react'
import ProForm, { ProFormCheckbox, ProFormText } from '@ant-design/pro-form'
import { history, SelectLang, useModel } from 'umi'
import Footer from '@/components/Footer'
import { login } from '@/services/ant-design-pro/api'
import styles from './index.less'
import { l } from '@/utils/intl'
import cookies from 'js-cookie'
import { setLocale } from '@@/plugin-locale/localeExports'

const Login: React.FC = () => {
  const [submitting, setSubmitting] = useState(false)

  const { initialState, setInitialState } = useModel('@@initialState')
  const [isLogin, setIsLogin] = useState<boolean>(true)

  const handleSubmit = async (values: API.LoginParams) => {
    if (!isLogin) {
      return
    }
    setIsLogin(false)
    setTimeout(() => {
      setIsLogin(true)
    }, 200)
    setSubmitting(true)
    try {
      // 登录
      const msg = await login({ ...values, type: 'password' })
      if (msg.code === 0 && msg.datas != undefined) {
        message.success(l('pages.login.success'))
        const userInfo = await initialState?.fetchUserInfo?.()
        if (userInfo) {
          setInitialState({
            ...initialState,
            currentUser: userInfo,
          })
        }
        setTimeout(() => {
          if (userInfo?.sa) {
            history.push('/sa/cluster/list')
          } else {
            const { query } = history.location
            const { redirect } = query as { redirect: string }
            history.push(redirect || '/')
          }
        }, 10)
        return
      } else {
        message.error(l(msg.msg, msg.msg))
      }
    } catch (error) {
      message.error(l('pages.login.failure'))
    }
    setSubmitting(false)
  }

  return (
    <div className={styles.container}>
      <div className={styles.lang}>
        {SelectLang && (
          <SelectLang
            onItemClick={(e) => {
              let language = e.key.toString()
              if (language === undefined || language === '') {
                language = localStorage.getItem('umi_locale')
              }
              cookies.set('language', language, { path: '/' })
              setLocale(language)
            }}
          />
        )}
      </div>
      <Card className={styles.loginBody}>
        <div className={styles.content}>
          <div className={styles.top}>
            <div className={styles.header}>
              <Avatar style={{ width: '100px', height: '100px' }} src={'/svolt.png'} />
              <strong style={{ paddingLeft: '20px', fontWeight: '500', fontSize: '20px' }}>
                {l('pages.layouts.userLayout.title')}
              </strong>
            </div>
          </div>

          <div className={styles.main}>
            <ProForm
              initialValues={{
                autoLogin: true,
              }}
              submitter={{
                searchConfig: {
                  submitText: l('pages.login.submit'),
                },
                render: (_, dom) => dom.pop(),
                submitButtonProps: {
                  loading: submitting,
                  size: 'large',
                  style: {
                    width: '100%',
                  },
                  htmlType: 'submit',
                },
              }}
              onFinish={async (values: API.LoginParams) => {
                await handleSubmit(values)
              }}
            >
              <ProFormText
                name="username"
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined className={styles.prefixIcon} />,
                }}
                placeholder={l('pages.login.username.placeholder')}
                rules={[
                  {
                    required: true,
                    message: l('pages.login.username.required'),
                  },
                ]}
              />
              <ProFormText.Password
                name="password"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined className={styles.prefixIcon} />,
                }}
                placeholder={l('pages.login.password.placeholder')}
                rules={[
                  {
                    required: true,
                    message: l('pages.login.password.required'),
                  },
                ]}
              />
              <div
                style={{
                  marginBottom: 24,
                }}
              >
                <ProFormCheckbox noStyle name="autoLogin">
                  {l('pages.login.rememberMe')}
                </ProFormCheckbox>
                <a
                  style={{
                    float: 'right',
                  }}
                >
                  {l('pages.login.forgotPassword')}
                </a>
              </div>
            </ProForm>
          </div>
        </div>
      </Card>
      <Footer />
    </div>
  )
}

export default Login
