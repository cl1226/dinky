import React, { useEffect, useState, useCallback, useMemo } from 'react'
/** app 核心组件 */
import { XFlow, XFlowCanvas, KeyBindings } from '@antv/xflow'
import type { IApplication, IAppLoad } from '@antv/xflow'
import { CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons'
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
  DagGraphExtension,
} from '@antv/xflow'

import { getVerticalTabs } from './json-form'
/** app 组件配置  */
/** 配置画布 */
import { useGraphHookConfig, useGraphConfig } from './config-graph'
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
import '@antv/xflow/dist/index.css'
import styles from './index.less'

export interface IProps {
  activeKey: string
  flowId: string
  width: number
}

export const XFlowEditor: React.FC<IProps> = (props) => {
  const { activeKey, flowId, width } = props
  const [showNodePanel, setShowNodePanel] = useState(true)

  const cache = React.useMemo<{ app: IApplication | null }>(
    () => ({
      app: null,
    }),
    [],
  )

  const [inited, setInited] = useState(false)
  const [meta, setMeta] = useState<IMeta>({ flowId: flowId })
  const graphHooksConfig = useGraphHookConfig(props)
  const graphConfig = useGraphConfig(props)

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

  const getNodeCollapsePosition = () => {
    if (showNodePanel) return { width: 160, top: 0, bottom: 0, left: 0 }

    return { width: 160, top: 0, left: 0, height: 40 }
  }

  return (
    <XFlow
      className={styles['xflow-wrap']}
      hookConfig={graphHooksConfig}
      modelServiceConfig={modelServiceConfig}
      commandConfig={cmdConfig}
      onLoad={onLoad}
      meta={meta}
      style={{ height: '100%', width: '100%' }}
    >
      <DagGraphExtension />
      <NodeCollapsePanel
        // searchService={dndPanelConfig.searchService}
        header={
          <div className="dnd-panel-header">
            节点库
            {!showNodePanel ? (
              <CaretDownOutlined
                onClick={() => setShowNodePanel(true)}
                style={{ marginLeft: '30px' }}
              />
            ) : (
              <CaretUpOutlined
                onClick={() => setShowNodePanel(false)}
                style={{ marginLeft: '30px' }}
              />
            )}
          </div>
        }
        nodeDataService={dndPanelConfig.nodeDataService}
        onNodeDrop={dndPanelConfig.onNodeDrop}
        position={getNodeCollapsePosition()}
        footerPosition={{ height: 0 }}
        bodyPosition={{ top: 40, bottom: 0, left: 0 }}
      />
      <CanvasToolbar
        className={'xflow-workspace-toolbar-top'}
        layout="horizontal"
        config={toolbarConfig}
        position={{ top: 0, left: 160, right: 0, bottom: 0 }}
      />
      <XFlowCanvas config={graphConfig} position={{ top: 40, left: 0, right: 32, bottom: 0 }}>
        <CanvasScaleToolbar position={{ top: 12, right: 12 }} />
        <CanvasContextMenu config={menuConfig} />
        <CanvasSnapline color="#faad14" />
        {/* <CanvasNodePortTooltip /> */}
      </XFlowCanvas>
      <JsonSchemaForm
        controlMapService={controlMapService}
        formSchemaService={formSchemaService}
        formValueUpdateService={formValueUpdateService}
        getCustomRenderComponent={() => getVerticalTabs({ width })}
        bodyPosition={{ top: 0, bottom: 0, right: 0 }}
        position={{ width: 32, top: 0, bottom: 0, right: 0 }}
        footerPosition={{ height: 0 }}
      />
      <KeyBindings config={keybindingConfig} />

      <svg width="100%" height="100%">
        <defs>
          <marker id="v-arrow-1" orient="auto" overflow="visible" markerUnits="userSpaceOnUse">
            <polygon
              id="v-166"
              stroke="#33aa99"
              fill="#33aa99"
              transform="rotate(180)"
              d="M 10 -5 0 0 10 5 z"
              points="12,6 6,0 12,-6 -6,0 12,6"
              strokeWidth="0"
            ></polygon>
          </marker>
          <marker id="v-arrow-2" orient="auto" overflow="visible" markerUnits="userSpaceOnUse">
            <polygon
              id="v-200"
              stroke="#33aa99"
              fill="#33aa99"
              transform="rotate(180)"
              d="M 10 -5 0 0 10 5 z"
              points="24,12 12,0 24,-12 -12,0 24,12"
              strokeWidth="0"
            ></polygon>
          </marker>
        </defs>
      </svg>
    </XFlow>
  )
}

export default XFlowEditor
