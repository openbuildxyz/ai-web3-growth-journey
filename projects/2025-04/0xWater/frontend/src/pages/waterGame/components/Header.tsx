import  { memo } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'

const Header = memo(() => {
  return (
    <div className="p-[4px]">
      <div className="title flex justify-between  items-center">
        <div className="left flex items-center pl-[20px] pt-[10px] ">
         
          <div className="ps-1 flex flex-col ">
            <h3 className="text-lg">水浒Attack</h3>
            <span className="text-xs text-gray-400">
              水浒宠物GameFi
            </span>
          </div>
        </div>
        <div className="right">
          <ConnectButton
            label="连接钱包"
            accountStatus="avatar"
            showBalance={{ smallScreen: true }}
            chainStatus={{ smallScreen: 'icon' }}
          />
        </div>
      </div>
    </div>
  )
})

export default Header
