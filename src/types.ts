export interface UploadParams {
    id: string
}

export interface File {
  name: string,
  data: Buffer
  size: number,
  encoding: string,
  tempFilePath: string,
  truncated: boolean,
  mimetype: string,
  md5: string,
  mv: Function // TODO: get the signature from 'fastify-file-upload' docs.
}

export interface UploadRequest {
    Params: UploadParams,
    Body: {
        [file: string]: File
    }
}
