import React, { memo, useState ,useCallback} from 'react'
import { useWatchContractEvent } from 'wagmi'
import { contractConfig } from '@/lib/context/ContractContext'
import Header from './components/Header.tsx'
import WaterContainer from './components/WaterContainer.tsx'
import Footer from './components/Footer.tsx'

 

const Water = memo(() => {
  const [menuActive,setMenuActive] =  useState("buy")
  useWatchContractEvent({
    address: contractConfig.address,
    abi: contractConfig.abi,
    eventName: 'WaterPurchased',
    onLogs(logs) {
      console.log('WaterPurchased logs!', logs)
    }
  })

  useWatchContractEvent({
    address: contractConfig.address,
    abi: contractConfig.abi,
    eventName: 'RequestFulfilled',
    onLogs(logs) {
      console.log('RequestFulfilled logs!', logs)
    }
  })

  useWatchContractEvent({
    address: contractConfig.address,
    abi: contractConfig.abi,
    eventName: 'RequestedRaffleWinner',
    onLogs(logs) {
      console.log('RequestedRaffleWinner logs!', logs)
    }
  })


  // menu change
  const handleMenuChange = useCallback((menu: string) => {
      setMenuActive(menu)
  }, [])

  return (
 
      <div  >
        <Header />
        <WaterContainer menuActive={menuActive} />
        <Footer handleMenuChange={handleMenuChange} menuActive={menuActive}  />
      </div>
  
  )
})

export default Water
