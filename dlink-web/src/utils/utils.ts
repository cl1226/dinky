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

/* eslint no-useless-escape:0 import/prefer-default-export:0 */
const reg =
  /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/

export const isUrl = (path: string): boolean => reg.test(path)

export const isAntDesignPro = (): boolean => {
  if (ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION === 'site') {
    return true
  }
  return window.location.hostname === 'preview.pro.ant.design'
}

// 给官方演示站点用，用于关闭真实开发环境不需要使用的特性
export const isAntDesignProOrDev = (): boolean => {
  const { NODE_ENV } = process.env
  if (NODE_ENV === 'development') {
    return true
  }
  return isAntDesignPro()
}

// 将枚举转换为option数组
export const transferEnumToOptions = (e, option?: any) => {
  const { labelKey = 'label', valueKey = 'value' } = option || {}
  return Object.keys(e).map((key) => ({
    [labelKey]: key,
    [valueKey]: e[key],
  }))
}
// 从枚举中获取label
export const getEnumLabel = (value, e) => {
  return Object.keys(e).find((key) => e[key] === value)
}

//将树形节点改为一维数组
export const generateList = (data: any, list: any[]) => {
  for (const element of data) {
    const node = element
    const { name, id, parentId, level } = node
    list.push({ name, id, key: id, title: name, parentId, level })
    if (node.children) {
      generateList(node.children, list)
    }
  }
  return list
}

// tree树 匹配方法
export const getParentKey = (key: number | string, tree: any): any => {
  let parentKey
  for (const element of tree) {
    const node = element
    if (node.children) {
      if (node.children.some((item: any) => item.id === key)) {
        parentKey = node.id
      } else if (getParentKey(key, node.children)) {
        parentKey = getParentKey(key, node.children)
      }
    }
  }
  return parentKey
}
