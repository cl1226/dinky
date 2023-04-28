/*
 * @Author: Rebecca Li
 * @Date: 2023-04-25 08:23:53
 * @LastEditors: Rebecca Li
 * @LastEditTime: 2023-04-25 15:44:55
 */
import type { IGraphCommand } from '@antv/xflow'

/** 节点命令 */
export namespace CustomCommands {
  const category = '节点操作'
  /** 异步请求demo */
  export const TEST_ASYNC_CMD: IGraphCommand = {
    id: 'xflow:async-cmd',
    label: '异步请求',
    category,
  }
  /** 重命名节点弹窗 */
  export const SHOW_RENAME_MODAL: IGraphCommand = {
    id: 'xflow:rename-node-modal',
    label: '打开重命名弹窗',
    category,
  }
  /** 部署服务 */
  export const DEPLOY_SERVICE: IGraphCommand = {
    id: 'xflow:deploy-service',
    label: '部署服务',
    category,
  }
  /** 抢锁，解锁服务 */
  export const LOCK_SERVICE: IGraphCommand = {
    id: 'xflow:lock-service',
    label: '部署服务',
    category,
  }
  /** 解锁服务 */
  export const UNLOCK_SERVICE: IGraphCommand = {
    id: 'xflow:unlock-service',
    label: '部署服务',
    category,
  }
  /** 上线服务 */
  export const ONLINE_SERVICE: IGraphCommand = {
    id: 'xflow:online-service',
    label: '上线服务',
    category,
  }
  /** 下线服务 */
  export const OFFLINE_SERVICE: IGraphCommand = {
    id: 'xflow:offline-service',
    label: '下线服务',
    category,
  }
}
