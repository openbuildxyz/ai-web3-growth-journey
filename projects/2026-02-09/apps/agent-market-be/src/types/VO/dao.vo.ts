/**
 * DAO 成员信息。
 */
export interface DaoMemberVo {
  /** 记录 ID */
  id: string
  /** 用户 ID */
  user_id: string
  /** 投票权 */
  voting_power: number
  /** 质押数量 */
  staked_amount: number
  /** 加入时间 */
  joined_at: string
}
