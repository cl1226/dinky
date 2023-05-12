import type { NsJsonSchemaForm } from '@antv/xflow'
import React from 'react'

export const TitleShape: React.FC<NsJsonSchemaForm.IControlProps> = (props) => {
  const { controlSchema } = props
  return (
    <h3
      style={{
        height: 34,
        lineHeight: '24px',
        color: 'rgba(0, 0, 0, 0.85)',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        paddingTop: 10,
        marginBottom: 10,
        fontWeight: 700,
      }}
    >
      {controlSchema.label}
    </h3>
  )
}
