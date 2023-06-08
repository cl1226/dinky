export enum EState {
  BLOCK = '阻断',
  DELAY_EXECUTION = '延时执行',
  DISPATCH = '派发',
  FAILURE = '失败',
  FORCED_SUCCESS = '强制成功',
  KILL = 'KILL',
  NEED_FAULT_TOLERANCE = '需要容错',
  PAUSE = '暂停',
  READY_BLOCK = '准备阻断',
  READY_PAUSE = '准备暂停',
  READY_STOP = '准备停止',
  RUNNING_EXECUTION = '正在运行',
  SERIAL_WAIT = '串行等待',
  STOP = '停止',
  SUBMITTED_SUCCESS = '提交成功',
  SUCCESS = '成功',
  WAITING_DEPEND = '等待依赖完成',
  WAITING_THREAD = '等待线程',
}
export enum ECommandType {
  SCHEDULER = '调度执行',
  START_PROCESS = '启动工作流',
  STOP = '停止',
  PAUSE = '暂停',
  REPEAT_RUNNING = '重跑',
  RECOVER_SUSPENDED_PROCESS = '恢复运行',
}
