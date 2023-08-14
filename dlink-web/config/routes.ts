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

/**
 * @name umi 的路由配置
 * @description 只支持 path,component,routes,redirect,wrappers,name,icon 的配置
 * @param hideInHeaderMenu 隐藏nav头的菜单
 * @param hideInMenu 隐藏菜单
 * @param path  path 只支持两种占位符配置，第一种是动态参数 :id 的形式，第二种是 * 通配符，通配符只能出现路由字符串的最后。
 * @param component 配置 location 和 path 匹配后用于渲染的 React 组件路径。可以是绝对路径，也可以是相对路径，如果是相对路径，会从 src/pages 开始找起。
 * @param routes 配置子路由，通常在需要为多个路径增加 layout 组件时使用。
 * @param redirect 配置路由跳转
 * @param wrappers 配置路由组件的包装组件，通过包装组件可以为当前的路由组件组合进更多的功能。 比如，可以用于路由级别的权限校验
 * @param name 配置路由的标题，默认读取国际化文件 menu.ts 中 menu.xxxx 的值，如配置 name 为 login，则读取 menu.ts 中 menu.login 的取值作为标题
 * @param icon 配置路由的图标，取值参考 https://ant.design/components/icon-cn， 注意去除风格后缀和大小写，如想要配置图标为 <StepBackwardOutlined /> 则取值应为 stepBackward 或 StepBackward，如想要配置图标为 <UserOutlined /> 则取值应为 user 或者 User
 * @param access 权限相关 需要在 src/access.ts内定义权限 使用名称 引用即可
 *              组件内的权限则使用 Hooks  + <Access /> 组件实现 详情见: https://umijs.org/docs/max/access
 * @doc https://umijs.org/docs/guides/routes
 * demo : https://github.com/ant-design/ant-design-pro/blob/master/config/routes.ts
 */
export default [
  {
    path: '/user',
    routes: [
      {
        path: '/user',
        routes: [
          {
            layout: false,
            name: 'login',
            path: '/user/login',
            component: './user/Login',
          },
          {
            path: '/user/cluster',
            name: 'cluster',
            component: './user/Cluster',
            hideInMenu: true,
            footerRender: false,
          },
        ],
      },
    ],
  },
  {
    path: '/sa',
    name: 'superAdmin',
    footerRender: false,
    hideInHeaderMenu: true,
    routes: [
      {
        path: '/sa',
        redirect: '/sa/cluster/list',
      },
      {
        name: 'clusterList',
        path: '/sa/cluster/list',
        component: './SuperAdmin/Cluster',
      },
      {
        path: '/sa/cluster/create',
        name: 'clusterCreate',
        component: './SuperAdmin/Cluster/Create',
        hideInMenu: true,
      },
      {
        path: '/sa/cluster/edit/:id',
        name: 'clusterEdit',
        component: './SuperAdmin/Cluster/Edit',
        hideInMenu: true,
      },
      {
        path: '/sa/cluster/view/:id',
        name: 'clusterView',
        component: './SuperAdmin/Cluster/View',
        hideInMenu: true,
      },
      {
        name: 'role',
        path: '/sa/role',
        component: './SuperAdmin/Role',
      },
      {
        name: 'user',
        path: '/sa/user',
        component: './SuperAdmin/User',
      },
      {
        name: 'systemInfo',
        path: '/sa/systemInfo',
        component: './SuperAdmin/SystemInfo',
      },
    ],
  },
  {
    path: '/',
    redirect: '/dashboard/workspace',
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    footerRender: false,
    routes: [
      {
        path: '/dashboard',
        redirect: '/dashboard/workspace',
      },
      {
        path: '/dashboard/workspace',
        name: 'workspace',
        component: './Dashboard/Workspace',
        hideInMenu: true,
      },
    ],
  },
  {
    path: '/dataDev',
    name: 'dataDev',
    icon: 'consoleSql',
    footerRender: false,
    routes: [
      {
        path: '/dataDev',
        redirect: '/dataDev/home',
      },
      {
        path: '/dataDev/home',
        name: 'dataDevHome',
        icon: 'windows',
        component: './DataDev/Home',
      },
      {
        path: '/dataDev/develop',
        name: 'develop',
        icon: 'cluster',
        routes: [
          {
            path: '/dataDev/develop/dataStudio',
            name: 'dataStudio',
            component: './DataStudio',
          },
          {
            path: '/dataDev/develop/dataJob',
            name: 'dataJob',
            component: './Scheduler',
          },
        ],
      },
      {
        path: '/dataDev/devops',
        name: 'devops',
        icon: 'cluster',
        routes: [
          {
            path: '/dataDev/devops/logCenter',
            name: 'logCenter',
            component: './DataDev/Devops/LogCenter',
          },
          {
            path: '/dataDev/devops/JobInfo',
            name: 'JobInfo',
            component: './DataDev/Devops/LogCenter/JobInfo',
            hideInMenu: true,
          },
          {
            path: '/dataDev/devops/overview',
            name: 'overview',
            component: './DataDev/Devops/Overview',
          },
          {
            path: '/dataDev/devops/processInstance',
            name: 'processInstance',
            component: './DataDev/Devops/ProcessInstance',
          },
          {
            path: '/dataDev/devops/taskInstance',
            name: 'taskInstance',
            component: './DataDev/Devops/TaskInstance',
          },
        ],
      },
    ],
  },
  {
    path: '/dataService',
    name: 'dataService',
    icon: 'appstore',
    footerRender: false,
    routes: [
      {
        path: '/dataService',
        redirect: '/dataService/serviceHome',
      },
      {
        path: '/dataService/serviceHome',
        name: 'serviceHome',
        icon: 'windows',
        component: './DataService/ServiceHome',
      },
      {
        path: '/dataService/serviceDashboard',
        name: 'serviceDashboard',
        icon: 'database',
        component: './DataService/ServiceDashboard',
      },
      {
        path: '/dataService/devApi',
        name: 'devApi',
        icon: 'cluster',
        routes: [
          {
            path: '/dataService/devApi/catalogue',
            name: 'catalogue',
            component: './DataService/ApiDev/Catalogue',
          },
          {
            path: '/dataService/devApi/management',
            name: 'management',
            component: './DataService/ApiDev/Management',
          },
          {
            path: '/dataService/devApi/create',
            name: 'create',
            component: './DataService/ApiDev/Create',
            hideInMenu: true,
          },
          {
            path: '/dataService/devApi/edit/:id',
            name: 'edit',
            component: './DataService/ApiDev/Edit',
            hideInMenu: true,
          },
          {
            path: '/dataService/devApi/detail/:id',
            name: 'detail',
            component: './DataService/ApiDev/Detail',
            hideInMenu: true,
          },
          {
            path: '/dataService/devApi/debug/:id',
            name: 'debug',
            component: './DataService/ApiDev/Debug',
            hideInMenu: true,
          },
        ],
      },
      {
        path: '/dataService/application',
        name: 'application',
        icon: 'appstore',
        component: './DataService/Application',
      },
      {
        path: '/dataService/application/detail/:id',
        name: 'applicationDetail',
        component: './DataService/Application/Detail',
        hideInMenu: true,
      },
    ],
  },
  {
    path: '/dataAsset',
    name: 'dataAsset',
    icon: 'appstore',
    footerRender: false,
    routes: [
      {
        path: '/dataAsset',
        redirect: '/dataAsset/metaDataCenter',
      },
      {
        path: '/dataAsset/metaDataCenter',
        name: 'metaDataCenter',
        component: './DataAsset/MetaDataCenter',
        icon: 'cluster',
      },
      {
        path: '/dataAsset/dataMap',
        redirect: '/dataAsset/dataMap/overview',
      },
      {
        path: '/dataAsset/dataMap',
        name: 'dataMap',
        icon: 'appstore',
        routes: [
          {
            path: '/dataAsset/dataMap/overview',
            name: 'overview',
            component: './DataAsset/DataMap/Overview',
          },
          {
            path: '/dataAsset/dataMap/dataDirectory',
            name: 'dataDirectory',
            component: './DataAsset/DataMap/DataDirectory',
          },
          {
            path: '/dataAsset/dataMap/assetDetail/:itemType/:id',
            name: 'assetDetail',
            component: './DataAsset/DataMap/AssetDetail',
            hideInMenu: true,
          },
        ],
      },
      {
        path: '/dataAsset/metaDataManage',
        redirect: '/dataAsset/metaDataManage/overview',
      },
      {
        path: '/dataAsset/metaDataManage',
        name: 'metaDataManage',
        icon: 'appstore',
        routes: [
          {
            path: '/dataAsset/metaDataManage/overview',
            name: 'overview',
            component: './DataAsset/MetaDataManage/Overview',
          },
          {
            path: '/dataAsset/metaDataManage/taskManage',
            name: 'taskManage',
            component: './DataAsset/MetaDataManage/TaskManage',
          },
          {
            path: '/dataAsset/metaDataManage/taskMonitoring',
            name: 'taskMonitoring',
            component: './DataAsset/MetaDataManage/TaskMonitoring',
          },
          {
            path: '/dataAsset/metaDataManage/detail/:id',
            name: 'detail',
            component: './DataAsset/MetaDataManage/Detail',
            hideInMenu: true,
          },
          {
            path: '/dataAsset/metaDataManage/create',
            name: 'create',
            component: './DataAsset/MetaDataManage/Create',
            hideInMenu: true,
          },
        ],
      },
    ],
  },
  {
    path: '/resource',
    name: 'resource',
    icon: 'appstore',
    footerRender: false,
    routes: [
      {
        path: '/resource',
        redirect: '/resource/flink/clusterInstance',
      },
      {
        path: '/resource/flink',
        name: 'flink',
        icon: 'cluster',
        routes: [
          {
            path: '/resource/flink/clusterInstance',
            name: 'clusterInstance',
            component: './Resource/FlinkManage/Cluster',
          },
          {
            path: '/resource/flink/clusterConfiguration',
            name: 'clusterConfiguration',
            component: './Resource/FlinkManage/ClusterConfiguration',
          },
          {
            path: '/resource/flink/flinkSettings',
            name: 'flinkConfig',
            component: './Resource/FlinkManage/FlinkSettings',
          },
          {
            path: '/resource/flink/udfTemplate',
            name: 'udfTemplate',
            component: './Resource/FlinkManage/UDFTemplate',
          },
        ],
      },
      {
        path: '/resource/resourcemanage',
        name: 'resourcemanage',
        icon: 'bank',
        footerRender: false,
        routes: [
          {
            path: '/resource/resourcemanage/jar',
            name: 'jar',
            icon: 'code-sandbox',
            component: './Resource/ResourceManage/Jar',
          },
          {
            path: '/resource/resourcemanage/document',
            name: 'document',
            icon: 'container',
            component: './Resource/ResourceManage/Document',
          },
          {
            path: '/resource/resourcemanage/document/edit/:id',
            name: 'documentEdit',
            hideInMenu: true,
            component: './Resource/ResourceManage/Document/Edit',
          },
          {
            path: '/resource/resourcemanage/document/detail/:id',
            name: 'documentDetail',
            hideInMenu: true,
            component: './Resource/ResourceManage/Document/Detail',
          },
        ],
      },
      {
        path: '/resource/database',
        name: 'database',
        icon: 'database',
        component: './Resource/DataBase',
      },
      {
        path: '/resource/alert',
        name: 'alert',
        icon: 'alert',
        routes: [
          {
            path: '/resource/alert/alertInstance',
            name: 'alertInstance',
            component: './Resource/AlertManage/AlertInstance',
          },
          {
            path: '/resource/alert/alertGroup',
            name: 'alertGroup',
            component: './Resource/AlertManage/AlertGroup',
          },
        ],
      },
      {
        path: '/resource/fragment',
        name: 'fragment',
        icon: 'cloud',
        component: './Resource/FragmentVariable',
      },
    ],
  },
  {
    name: 'authenticationCenter',
    icon: 'SafetyCertificateOutlined',
    path: '/authenticationCenter',
    access: 'canAdmin',
    routes: [
      {
        path: '/authenticationCenter',
        redirect: '/authenticationCenter/userManager',
      },
      {
        path: '/authenticationCenter/userManager',
        name: 'userManager',
        icon: 'UserOutlined',
        component: './AuthenticationCenter/UserManager',
      },
      {
        path: '/authenticationCenter/roleManager',
        name: 'roleManager',
        icon: 'TeamOutlined',
        component: './AuthenticationCenter/RoleManager',
      },
      {
        path: '/authenticationCenter/roleSelectPermissions',
        name: 'roleSelectPermissions',
        icon: 'FundViewOutlined',
        component: './AuthenticationCenter/RoleSelectPermissions',
      },
      {
        path: '/authenticationCenter/namespaceManager',
        name: 'namespaceManager',
        icon: 'BulbOutlined',
        component: './AuthenticationCenter/NamespaceManager',
      },
      {
        path: '/authenticationCenter/tenantManager',
        name: 'tenantManager',
        icon: 'SecurityScanOutlined',
        component: './AuthenticationCenter/TenantManager',
      },
    ],
  },
  {
    component: './404',
  },
]
