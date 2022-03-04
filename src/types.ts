export interface File {
  name: string
  data: Buffer
  size: number
  encoding: string
  tempFilePath: string
  truncated: boolean
  mimetype: string
  md5: string
  mv: () => undefined
}

export interface Files {
  [file: string]: File
}

export interface IdParams {
  id: string
}
