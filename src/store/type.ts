import { AuthClient, BucketClient, PinningClient } from '@4everland/upload-pin'

interface ProjectConfigItem {
  name: string
  options: {
    key: string
    placeholder: string
    type: string
    value: string
  }[]
  tag?: string
}
export interface ProjectInfo {
  config: ProjectConfigItem[]
}

export interface verifyResult {
  accessBucket: string
  accessKeyId: string
  expiration: number
  folderPath: string
  secretAccessKey: string
  sessionToken: string
  token: string
}
export interface RootState {
  authClient: AuthClient | null
  expiration: number
  address: string | null
  sts: verifyResult | null
  bucketClient: BucketClient | null
  pinningClient: PinningClient | null
  projectInfo: ProjectInfo | null
}
