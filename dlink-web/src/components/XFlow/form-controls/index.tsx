import type { NsJsonSchemaForm } from '@antv/xflow'
import { EditorShape } from './custom-editor'
import { LinkShape } from './link'
import { SelectorShape } from './selector'
import { SpanShape } from './span'

/** 自定义form控件 */
export enum ControlShapeEnum {
  'EDITOR' = 'EDITOR',
  'LINKSHAPE' = 'LINKSHAPE',
  'SelectorShape' = 'SelectorShape',
  'SpanShape' = 'SpanShape'
}

export const controlMapService: NsJsonSchemaForm.IControlMapService = controlMap => {
  controlMap.set(ControlShapeEnum.EDITOR, EditorShape)
  controlMap.set(ControlShapeEnum.LINKSHAPE, LinkShape)
  controlMap.set(ControlShapeEnum.SelectorShape, SelectorShape)
  controlMap.set(ControlShapeEnum.SpanShape, SpanShape)
  return controlMap
}
