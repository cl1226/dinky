import { ITEMTYPE } from '@/pages/DataAsset/DataMap/type.d'

const defaultSize = 20

export const getIcon = (type: string, size?: number) => {
  let imgSize = size || defaultSize
  switch (type) {
    case ITEMTYPE.Column:
      return (
        <img
          style={{ width: imgSize, height: imgSize }}
          src={`/dataAsset/dataMap/${ITEMTYPE.Column}.svg`}
          alt=""
        />
      )
    case ITEMTYPE.Database:
      return (
        <img
          style={{ width: imgSize, height: imgSize }}
          src={`/dataAsset/dataMap/${ITEMTYPE.Database}.svg`}
          alt=""
        />
      )
    case ITEMTYPE.Table:
      return (
        <img
          style={{ width: imgSize, height: imgSize }}
          src={`/dataAsset/dataMap/${ITEMTYPE.Table}.svg`}
          alt=""
        />
      )
    default:
      return (
        <img
          style={{ width: imgSize, height: imgSize }}
          src={`/dataAsset/dataMap/${ITEMTYPE.Table}.svg`}
          alt=""
        />
      )
  }
}
