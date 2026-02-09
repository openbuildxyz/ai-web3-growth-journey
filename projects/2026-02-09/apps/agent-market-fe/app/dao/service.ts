import { z } from 'zod'
import { useMemo } from 'react'
import { formatUnits } from 'ethers'
import { useQuery, useQueries } from '@tanstack/react-query'
import { catchError, concatMap, firstValueFrom, from, map, of } from 'rxjs'

import useWallet from '@/lib/hooks/useWallet'
import { createServiceContext } from '@/lib/utils'
import { mapCaseToUI } from '@/lib/contracts/mappers'
import { ARBITRATION_DEPLOY_BLOCK } from '@/lib/constants'
import { type ArbitrationCase, type DaoMember } from '@/lib/types/dao'
import { useTokenSymbol, useTokenDecimals } from '@/lib/hooks/usePlatformToken'
import {
  readCase,
  readTask,
  readStaked,
  readTotalStaked,
  readCaseOpenedTaskIds,
  readStakerAddresses,
} from '@/lib/contracts/utils'

const BACKEND_DOMAIN =
  process.env.NEXT_PUBLIC_BACKEND_DOMAIN ?? 'http://localhost:8000'

const DaoMembersResponse = z.object({
  // data: z.array(
  //   z
  //     .object({
  //       id: z.string().optional(),
  //       user_id: z.string().optional(),
  //       address: z.string().optional(),
  //       voting_power: z.number().optional(),
  //       votingPower: z.number().optional(),
  //       avatar: z.string().optional(),
  //     })
  //     .transform((item) => ({
  //       address: item.address || item.user_id || '',
  //       votingPower: item.votingPower ?? item.voting_power ?? 0,
  //       avatar: item.avatar,
  //     })),
  // ),
  total: z.number(),
})

// Backend returns case list with taskIds

export default function useDaoService() {
  const { provider } = useWallet()

  // Fetch case list from backend (enumeration)
  const {
    data: caseListData,
    error: casesError,
    isLoading: casesLoading,
  } = useQuery({
    queryKey: ['dao', 'cases', 'onchain'],
    queryFn: async () => {
      if (!provider) return []
      return await readCaseOpenedTaskIds(provider, ARBITRATION_DEPLOY_BLOCK)
    },
    enabled: Boolean(provider),
  })

  // 查询所有质押过的仲裁员地址
  const { data: stakerAddresses, isLoading: stakersLoading } = useQuery({
    queryKey: ['dao', 'stakers', 'onchain'],
    queryFn: async () => {
      if (!provider) return []
      return await readStakerAddresses(provider, ARBITRATION_DEPLOY_BLOCK)
    },
    enabled: Boolean(provider),
  })

  // Fetch token info for formatting
  const { data: tokenSymbol } = useTokenSymbol()
  const { data: tokenDecimals } = useTokenDecimals()

  // Fetch case details for each caseId from contracts
  const caseQueries = useQueries({
    queries:
      caseListData?.map((taskId) => ({
        queryKey: ['dao', 'case', 'detail', taskId],
        queryFn: async () => {
          if (!provider || !tokenDecimals || !tokenSymbol) {
            return null
          }

          const taskIdBigInt = BigInt(taskId)
          // Fetch case and task in parallel
          const [case_, task] = await Promise.all([
            readCase(provider, taskIdBigInt),
            readTask(provider, taskIdBigInt),
          ])

          if (!case_ || !task) {
            return null
          }

          // Use metaHash as task title placeholder (in real app, resolve from IPFS)
          const taskTitle = `Task #${taskId}`

          return mapCaseToUI(
            case_,
            taskId,
            taskTitle,
            tokenDecimals,
            tokenSymbol,
          )
        },
        enabled: Boolean(provider && tokenDecimals && tokenSymbol),
        staleTime: 10_000,
      })) ?? [],
  })

  // Combine case details
  const allCases = useMemo(() => {
    return caseQueries
      .map((query) => query.data)
      .filter((case_): case_ is ArbitrationCase => !!case_)
  }, [caseQueries])

  // Fetch DAO members from backend
  const {
    data: membersData,
    error: membersError,
    isLoading: membersLoading,
  } = useQuery({
    queryKey: ['dao', 'members'],
    async queryFn() {
      if (!BACKEND_DOMAIN) {
        return { data: [], total: 0 }
      }
      return await firstValueFrom(
        from(fetch(`${BACKEND_DOMAIN}/dao/members`)).pipe(
          concatMap((res) => res.json()),
          map((res) => DaoMembersResponse.parse(res)),
          catchError((err) => {
            console.error('Failed to fetch DAO members:', err)
            return of({ data: [], total: 0 })
          }),
        ),
      )
    },
  })

  // Fetch total staked from contract
  const { data: totalStakedRaw, isLoading: totalStakedLoading } = useQuery({
    queryKey: ['dao', 'totalStaked'],
    queryFn: async () => {
      if (!provider) return null
      return await readTotalStaked(provider)
    },
    enabled: Boolean(provider),
  })

  const totalStaked = useMemo(() => {
    if (
      totalStakedRaw === null ||
      totalStakedRaw === undefined ||
      !tokenDecimals
    )
      return '0'
    return formatUnits(totalStakedRaw, tokenDecimals)
  }, [totalStakedRaw, tokenDecimals])

  // Fetch real-time staked balance (voting power) for each member from contract
  // const memberQueries = useQueries({
  //   queries:
  //     membersData?.data.map((member) => ({
  //       queryKey: ['dao', 'member', 'staked', member.address],
  //       queryFn: async () => {
  //         if (!provider || !tokenDecimals) return null
  //         const stakedRaw = await readStaked(provider, member.address)
  //         return {
  //           ...member,
  //           votingPower: Number(formatUnits(stakedRaw, tokenDecimals)),
  //         }
  //       },
  //       enabled: Boolean(provider && tokenDecimals),
  //       staleTime: 30_000,
  //     })) ?? [],
  // })

  // const daoMembers = useMemo(() => {
  //   if (!membersData) return []
  //   // If we have contract data, use it, otherwise fallback to backend data
  //   const hasContractData =
  //     memberQueries.length > 0 && memberQueries.some((q) => q.data)
  //   if (hasContractData) {
  //     return memberQueries
  //       .map((q) => q.data)
  //       .filter((m): m is NonNullable<typeof m> => !!m) as DaoMember[]
  //   }
  //   return membersData.data as DaoMember[]
  // }, [membersData, memberQueries])

  const activeCases = allCases.filter((c) => c.status === 'voting')
  const resolvedCases = allCases.filter(
    (c) => c.status === 'resolved_buyer' || c.status === 'resolved_seller',
  )

  const isLoadingCases =
    casesLoading ||
    caseQueries.some((q) => q.isLoading) ||
    // memberQueries.some((q) => q.isLoading) ||
    !tokenDecimals ||
    !tokenSymbol ||
    !provider ||
    totalStakedLoading

  return {
    activeCases,
    resolvedCases,
    // daoMembers,
    totalStaked,
    tokenSymbol,
    error: casesError || membersError,
    totalMembers: membersData?.total ?? 0,
    isLoading: isLoadingCases || membersLoading,
  }
}

export const DaoServiceContext = createServiceContext(useDaoService)
