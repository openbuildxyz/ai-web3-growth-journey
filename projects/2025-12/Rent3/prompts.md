# 主要 prompts

## 产品需求

网站整体需要简约风格，类似 airbnb 风格。
Rent3 需要有一个落地页，网站全部是英文的，顶部导航栏分别有Home，My Properties
Rent3是一个基于区块链的租房合同，网站角色有 2 个人，1：property owner/agent，  2：租客。
property owner/agent 点击 My Properties 按钮会显示他发布的 properties，然后可以 增删改查property。Property 有属性：name，location，pictures(可以 upload多个图片或者删除),Monthly rent 价格，description。

首页对应的路由为/，要求:
首页展示 Property List，这个 List展示图片类似 airbnb，然后显示名字，city 和 monthly rent 价格，和 buy rental contract。

详情页对应的路由为/properties/{propertyID}，要求:
用户点击list 中的 property就跳转到详情页，用户就可以 buy rental contract。

My Properties页对应的路由为/my-properties/{propertyID}. My Properties详情页对应的路由为/my-properties/{propertyID}.

用户角色：
1 property owner/agent
他可以发布和管理 properties，也可以购买别人的 contract
2 tenant
他也可以发布和管理 properties，也可以购买别人的 contract

支付系统
用户 A 点击用户 B 名下的 property 的buy rental contract后会弹出 metamask 钱包，然后付款，那么这个 rental contract 就会从 B 名下转到 A 名下，这个交易是 blockchain 的交易，这个支付先不开发，你只写到点击那个按钮，然后就是付款成功显示付款成功返回到他的 my properties。

## 网站技术
1，网站就用先用的 supabase 作为数据库，数据库链接，所有数据存在数据库里，数据库操作全部使用drizzle ORM 实现，并自动 push创建数据库。
2，用现有的 nextjs 作为框架，你基于现有的 supabase-starter项目脚手架开发，
3，环境变量在。.env.local 里
4，前端样式要求现代简约，使用tailwindCSS + ShadcnUI 实现




## backend prompt

请帮我搭建一个极简区块链 DEMO，满足以下核心需求：
1.  无需智能合约，仅实现测试网 ETH 转账+前端状态同步
2.  前端页面布局：
    - 展示1个租房合同：标题「清迈尚泰中心」，标价0.1 Sepolia测试ETH，显示当前所属人地址（初始为A：0x687B367eC1E071210AA3Da2414D09B58981B597c）
    - 展示两个用户区域：A（初始持有合同，无其他资产）、B（初始无任何合同）
    - 合同下方放置「BUY」购买按钮
3.  交互流程：
    - 点击「BUY」按钮，唤起MetaMask（小狐狸）钱包，触发从购买方（B的地址）向任意指定收款地址转账0.1 Sepolia测试ETH
    - 转账成功后，链上可在Sepolia Etherscan查询到该笔交易记录
    - 前端自动更新状态：租房合同从A的名下转移到B的名下，页面实时展示该变化（A名下清空，B名下显示「清迈尚泰中心」合同）
4.  技术要求：
    - 适配Sepolia测试网，无需复杂配置，新手可直接运行
    - 前端简洁易懂，无需后端服务，纯前端实现即可
    - 确保转账流程可追溯，测试网浏览器能查询到交易详情