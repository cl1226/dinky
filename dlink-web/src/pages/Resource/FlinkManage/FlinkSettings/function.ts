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

import { getData, postAll } from '@/components/Common/crud'
import { message } from 'antd'
import { l } from '@/utils/intl'

export function loadSettings(dispatch: any) {
  const res = getData('api/sysConfig/getAll')
  res.then((result) => {
    result.datas &&
      dispatch &&
      dispatch({
        type: 'FlinkSettings/saveSettings',
        payload: result.datas,
      })
  })
}

export function saveSettings(values: {}, dispatch: any) {
  const res = postAll('api/sysConfig/updateSysConfigByJson', values)
  res.then((result) => {
    message.success(l('app.request.update.setting.success'))
    dispatch &&
      dispatch({
        type: 'FlinkSettings/saveSettings',
        payload: values,
      })
  })
}