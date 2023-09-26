import { AuthClient, BucketClient, PinningClient } from '4everland-pinning'

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
}
