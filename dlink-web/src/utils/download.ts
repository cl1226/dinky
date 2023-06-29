import { request2, CODE } from '@/components/Common/crud'

export const downloadBlob = (url: string, fileName: string) => {
  request2(url, {
    method: 'GET',
    // 必须加responseType: 'blob',
    responseType: 'blob',
  }).then((res) => {
    const blob = new Blob([res]) //注意拿到的是数据流！！
    const objectURL = URL.createObjectURL(blob)
    let btn = document.createElement('a')
    btn.download = fileName //文件类型
    btn.href = objectURL
    btn.click()
    URL.revokeObjectURL(objectURL)
    btn = null
  })
}
