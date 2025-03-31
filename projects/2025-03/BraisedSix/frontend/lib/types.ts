import type { ethers } from "ethers"

export enum TaskStatus {
  Open = 0,
  Pending = 1,
  Finish = 2,
  Close = 3,
}

export type Task = {
  index: number
  title: string
  desc: string
  target: string
  limitTime: number
  startTime: number
  bounty: ethers.BigNumberish
  bountyFormatted: string
  status: TaskStatus
  owner: string
  executor: string
  finish: boolean
}

// 添加事件类型定义，用于解析合约事件
export interface PublishTaskEvent {
  owner: string
  index: number
  task: Task
}

export interface TaskEvent {
  owner: string
  executor: string
  index: number
}

