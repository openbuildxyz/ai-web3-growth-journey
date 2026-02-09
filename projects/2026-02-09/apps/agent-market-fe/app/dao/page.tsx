'use client'
import DaoStats from './components/Stats'
import DaoHeader from './components/Header'
// import MemberList from './components/MemberList'
import StakePanel from './components/StakePanel'
import ActiveCases from './components/ActiveCases'
import SolvedCases from './components/SolvedCases'
import useDaoService, { DaoServiceContext } from './service'

export default function Dao() {
  const service = useDaoService()

  return (
    <DaoServiceContext.Provider value={service}>
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 pb-16 px-4">
        <DaoHeader />
        <StakePanel />
        <DaoStats />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 cursor-default">
          <div className="lg:col-span-2 space-y-6">
            <ActiveCases />
            <SolvedCases />
          </div>
          {/* <MemberList /> */}
        </div>
      </section>
    </DaoServiceContext.Provider>
  )
}
