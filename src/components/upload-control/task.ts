import type { BucketClient, PinningClient } from '4everland-pinning'
import type { PinInfo, UploadResult } from '4everland-pinning/dist/types/core/type'
interface TaskParams {
  Bucket: string
  Key: string
  Body: File
  ContentType: string
}
class Task {
  static id = 0
  status = 0 // pre loading
  id: number
  uploadInstance: UploadResult
  pinningClient: PinningClient
  cid: string = ''
  taskParams: TaskParams
  progress: number = 0
  pinResult: PinInfo | null = null
  constructor(bucketClient: BucketClient, taskParams: TaskParams, pinningClient: PinningClient) {
    this.taskParams = taskParams
    this.uploadInstance = bucketClient.uploadObject(taskParams)
    this.id = Task.id++
    this.pinningClient = pinningClient
  }
  async done() {
    try {
      this.status = 1 //loading...
      this.uploadInstance.progress((e: any) => {
        console.log(e)
        this.progress = Math.ceil((e.loaded / e.total) * 100)
        console.log(this.progress)
      })
      const { cid } = await this.uploadInstance.done()
      this.status = 3 // success
      this.cid = cid
      await this.addPin()
      this.status = 4
    } catch (error) {
      this.status = 5 // error
    }
  }
  async abort() {
    await this.uploadInstance.abort()
    this.status = 2 // abort
  }

  async addPin() {
    if (!this.cid) return
    try {
      const result = await this.pinningClient.addPin({
        cid: this.cid,
        name: this.taskParams.Body.name
      })
      this.pinResult = result
      // do something
    } catch (error) {
      console.log(error)
    }
  }
}

class TaskWrapper {
  tasks: Task[] = []
  limit: number
  constructor(limit: number) {
    this.limit = limit
  }
  pushTasks(task: Task) {
    this.tasks.push(task)
  }
  progressTask() {
    const uploadingTasks = this.tasks.filter((task) => {
      return task.status == 1
    })
    if (uploadingTasks.length >= this.limit) return
    const preUploadTasks = this.tasks.filter((task) => {
      return task.status == 0
    })
    if (!preUploadTasks) return
    const fill = this.limit - uploadingTasks.length
    const finalCount = preUploadTasks.length <= fill ? preUploadTasks.length : fill

    for (let i = 0; i < finalCount; i++) {
      this.startTask(preUploadTasks[i])
    }
  }
  async startTask(task: Task) {
    try {
      await task.done()
      this.progressTask()
    } catch (error) {
      console.log(error)
    }
  }
}

// const task = new Task()

export { Task, TaskWrapper }
