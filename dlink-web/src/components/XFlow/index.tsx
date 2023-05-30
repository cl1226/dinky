import React, { useState } from 'react'
/** app 核心组件 */
import { XFlow, XFlowCanvas, KeyBindings } from '@antv/xflow'
import type { IApplication, IAppLoad } from '@antv/xflow'
import {CaretDownOutlined, CaretUpOutlined} from '@ant-design/icons';
/** 交互组件 */
import {
  /** 触发Command的交互组件 */
  CanvasScaleToolbar,
  JsonSchemaForm,
  NodeCollapsePanel,
  CanvasContextMenu,
  CanvasToolbar,
  /** Graph的扩展交互组件 */
  CanvasSnapline,
  CanvasNodePortTooltip,
  DagGraphExtension
} from '@antv/xflow'

import { CustomJsonForm } from './json-form'
/** app 组件配置  */
/** 配置画布 */
import { useGraphHookConfig } from './config-graph'
/** 配置Command */
import { useCmdConfig, initGraphCmds } from './config-cmd'
/** 配置Model */
import { useModelServiceConfig } from './config-model-service'
/** 配置Menu */
import { useMenuConfig } from './config-menu'
/** 配置Toolbar */
import { useToolbarConfig } from './config-toolbar'
/** 配置快捷键 */
import { useKeybindingConfig } from './config-keybinding'
/** 配置Dnd组件面板 */
import * as dndPanelConfig from './config-dnd-panel'
/** 配置JsonConfigForm */
import { formSchemaService, formValueUpdateService, controlMapService } from './config-form'
import { IMeta } from './service'
import './index.less'
import '@antv/xflow/dist/index.css'
export interface IProps {
  activeKey: string
  flowId: string
}

export const XFlowEditor: React.FC<IProps> = (props) => {
  const { activeKey, flowId } = props

  const [showNodePanel, setshowNodePanel] = useState(false)

  const cache = React.useMemo<{ app: IApplication | null }>(
    () => ({
      app: null,
    }),
    [],
  )
  const [inited, setInited] = useState(false)
  const [meta, setMeta] = useState<IMeta>({ flowId: flowId })
  const graphHooksConfig = useGraphHookConfig(props)
  const toolbarConfig = useToolbarConfig()
  const menuConfig = useMenuConfig()
  const cmdConfig = useCmdConfig()
  const modelServiceConfig = useModelServiceConfig()
  const keybindingConfig = useKeybindingConfig()

  const handleMeta = async (remainMeta) => {
    setMeta(remainMeta)
    setInited(true)
  }

  /**
   * @param app 当前XFlow工作空间
   * @param extensionRegistry 当前XFlow配置项
   */
  const onLoad: IAppLoad = async (app) => {
    cache.app = app
    initGraphCmds(cache.app, handleMeta)
  }

  /** 父组件meta属性更新时,执行initGraphCmds */
  React.useEffect(() => {
    if (cache.app && meta.flowId !== activeKey) {
      initGraphCmds(cache.app, handleMeta)
    }
  }, [cache.app, flowId])



  return (
    <XFlow
      // className="dag-user-custom-clz"
      className={`dag-user-custom-clz dag-user-custom-clz-custom${showNodePanel && '-hidden'}`}
      hookConfig={graphHooksConfig}
      modelServiceConfig={modelServiceConfig}
      commandConfig={cmdConfig}
      onLoad={onLoad}
      meta={meta}
      style={{ height: 'calc(100vh - 82px - 32px)', width: '100%' }}
    >
      <DagGraphExtension />
      <NodeCollapsePanel
        className="xflow-node-panel"
        // searchService={dndPanelConfig.searchService}
        header={<div className="dnd-panel-header"> 节点库{showNodePanel} 
        {
          showNodePanel ? (<CaretDownOutlined  onClick={() => setshowNodePanel(!showNodePanel)} style={{'margin-left': '30px'}}/>)
          : (<CaretUpOutlined onClick={() => setshowNodePanel(!showNodePanel)} style={{'margin-left': '30px'}}/>)
        }
        </div>}
        nodeDataService={dndPanelConfig.nodeDataService}
        onNodeDrop={dndPanelConfig.onNodeDrop}
        position={{ width: 230, top: 0, bottom: 0, left: 0 }}
        footerPosition={{ height: 0 }}
        bodyPosition={{ top: 40, bottom: 0, left: 0 }}
      />
      <CanvasToolbar
        className="xflow-workspace-toolbar-top"
        layout="horizontal"
        config={toolbarConfig}
        position={{ top: 0, left: 230, right: 320, bottom: 0 }}
      />
      <XFlowCanvas position={{ top: 40, left: 230, right: 32, bottom: 0 }}>
        <CanvasScaleToolbar position={{ top: 12, right: 12 }} />
        <CanvasContextMenu config={menuConfig} />
        <CanvasSnapline color="#faad14" />
        <CanvasNodePortTooltip />
      </XFlowCanvas>
      <JsonSchemaForm
        controlMapService={controlMapService}
        formSchemaService={formSchemaService}
        formValueUpdateService={formValueUpdateService}
        getCustomRenderComponent={CustomJsonForm.getCustomRenderComponent}
        bodyPosition={{ top: 0, bottom: 0, right: 0 }}
        position={{ width: 34, top: 0, bottom: 0, right: 0 }}
        footerPosition={{ height: 0 }}
      />
      <KeyBindings config={keybindingConfig} />
    </XFlow>
  )
}

export default XFlowEditor
