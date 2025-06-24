import { memo, useState, useContext, useEffect } from 'react'
import { useReadContract } from 'wagmi'
import { contractConfig } from '@/lib/context/ContractContext'
import Attack from './Attack'
import Buy from './Buy'

interface IWater {
  menuActive: string
}

const WaterContainer = memo(({menuActive}: IWater) => {
  const { data: pixels, isPending } = useReadContract({
    ...contractConfig,
    functionName: 'getPixelArray'
  })




  ////////////
  // effect //
  ////////////
 
 

  return (
    <div className="mx-auto h-full">
      {isPending ? (
        <div>Loading...</div>
      ) : (
        <div>
          {
            menuActive === "buy" ? <Buy />:<Attack />
          }
        </div>
      )}
    </div>
  )
})

export default WaterContainer
