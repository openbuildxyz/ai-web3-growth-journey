import React, { createContext, useContext } from 'react';

// 创建Web3上下文
const Web3Context = createContext();

// 导出Provider组件
export const Web3Provider = ({ children, value }) => {
  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};

// 创建自定义钩子以便于在组件中使用
export const useWeb3 = () => {
  return useContext(Web3Context);
};
