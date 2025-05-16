"use client";

import {
  Bubble,
  Sender,
  useXAgent,
  useXChat,
  ThoughtChain,
} from "@ant-design/x";
import React from "react";
import { PaperClipIcon } from "@heroicons/react/24/outline"; // Using Heroicon
import {
  UserOutlined,
  LoadingOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { PlusCircleIcon, XMarkIcon } from "@heroicons/react/24/outline"; // Import icons

import type { ThoughtChainItem } from "@ant-design/x";

import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const iceland = localFont({
  src: "../fonts/Iceland-Regular.ttf",
  display: "swap",
  preload: true,
});
// Define roles for Bubble.List using DaisyUI/Tailwind concepts if needed,
// but @ant-design/x might handle basic styling.
const roles: React.ComponentProps<typeof Bubble.List>["roles"] = {
  ai: {
    placement: "start",
    // Add Tailwind/DaisyUI classes here if needed for custom styling
    // className: 'chat chat-start', // Example DaisyUI classes
    typing: { step: 10 },
    avatar: {
      icon: (
        <img src="https://goin.obs.cn-north-4.myhuaweicloud.com/acticity/head/head03.jpg" />
      ),
      style: { background: "#fde3cf" },
    },
    styles: {
      // Keep basic style overrides if necessary
      content: { borderRadius: "1rem", padding: "0.75rem 1rem" }, // Example: Rounded corners and padding
    },
  },
  local: {
    placement: "end",
    variant: "shadow",
    avatar: {
      icon: <UserOutlined />,
      style: { background: "#87d068" },
    },
    // className: 'chat chat-end', // Example DaisyUI classes
    styles: {
      content: {
        borderRadius: "1rem",
        padding: "0.75rem 1rem",
        backgroundColor: "hsl(var(--p))",
        color: "hsl(var(--pc))",
      }, // Example: Primary color bg
    },
    // variant: 'shadow', // This might be an antd-specific variant, removed
  },
};

interface AgentChatProps {
  agentName: string;
  // Add any other props needed, e.g., API endpoint for the agent
}

function getStatusIcon(status: ThoughtChainItem["status"]) {
  switch (status) {
    case "success":
      return <CheckCircleOutlined />;
    case "error":
      return <InfoCircleOutlined />;
    case "pending":
      return <LoadingOutlined />;
    default:
      return undefined;
  }
}

const mockServerResponseData: ThoughtChainItem[] = [];

const delay = (ms: number) => {
  return new Promise<void>((resolve) => {
    const timer: NodeJS.Timeout = setTimeout(() => {
      clearTimeout(timer);
      resolve();
    }, ms);
  });
};

function addChainItem() {
  const index = mockServerResponseData.length;
  let title = "";
let description = "";

  switch (index) {
    case 0:
      title = "WalletAnalyze";
      description=  '正在调用WalletAnalyze分析对应钱包记录 -> WalletAnalyze'
      break;
    case 1:
      title = "TwitterCrawler";
      description=  '正在调用分析推特热度 -> TwitterCrawler'

      break;
    case 2:
      title = "GoPlus";
      description=  '正在调用GoPlus分析代币安全性 —> GoPlus'
      break;
    case 3:
      title = "JupSwap";
      description=  '正在调用Jup Swap进行交易'
      break;
  }

  mockServerResponseData.push({
    title,
    status: "pending",
    icon: getStatusIcon("pending"),
    description,
  });
}

async function updateChainItem(status: ThoughtChainItem["status"]) {
  await delay(1000);
  const index = mockServerResponseData.length - 1;

  let description = "";
  switch (index) {
    case 0:
      description = "搜索到最近交易的代币Candle(A8bcY1eSenMiMy75vgSnp6ShMfWHRHjeM6JxfM1CNDL)";
      break;
    case 1:
      description = "搜索到有30条推文，对最近5条文章进行分析，大家对代币保持积极的态度，认为Candle短期可以炒作";
      break;
    case 2:
      description = "没有发现风险项，前十占比16.5%，符合交易规则，开始swap 1sol购买Candle";
      break;
    case 3:
      description = "执行交易成功，流程结束";
      break;
  }

  mockServerResponseData[index].status = status;
  mockServerResponseData[index].icon = getStatusIcon(status);
  mockServerResponseData[index].description = description;
}

const AgentChat: React.FC<AgentChatProps> = ({ agentName }) => {
  // State for input content
  const [content, setContent] = React.useState("");

  // Mock Agent Logic (Replace with actual API interaction)
  const [agent] = useXAgent({
    request: async ({ message }, { onSuccess }) => {
      console.log(`Sending to ${agentName}:`, message);
      // Simulate API delay
      onClick();

      await new Promise((resolve) => setTimeout(resolve, 3000));
      // Mock response
      onClick();

      await new Promise((resolve) => setTimeout(resolve, 3000));
      onClick();

      await new Promise((resolve) => setTimeout(resolve, 3000));
      onClick();

      await new Promise((resolve) => setTimeout(resolve, 2000));
      onSuccess(`
尊敬的用户，本次投资决策与执行已顺利完成，现将全流程复盘如下：

一、数据洞察与分析阶段

1. 钱包数据扫描：启动WalletAnalyze工具，精准定位到近期交互代币**Candle（合约地址：A8bcY1eSenMiMy75vgSnp6ShMfWHRHjeM6JxfM1CNDL）**，锁定潜在投资目标。

2. 舆情动态监测：借助TwitterCrawler抓取到**30条相关推文**，深入剖析近5条高互动内容发现，市场情绪显著乐观，多数观点认为Candle具备**短期炒作价值**，印证市场关注度与投资潜力。

3. 安全风险评估：通过GoPlus专业审计，确认代币**无安全漏洞**，且前十大持仓占比仅**16.5%**，流通结构分散，符合稳健投资的风控标准。

二、交易执行阶段
基于多维数据交叉验证，触发自动化交易指令：通过Jup Swap协议，以**1 SOL**成功购入Candle代币，交易瞬时完成，确保捕捉市场先机。

三、后续行动建议
建议持续关注Candle的链上数据与社区热度变化，我将实时监控价格波动、大户动向等指标，一旦触发止盈止损条件，将立即执行调仓策略，为您的资产保驾护航。 `);
    },
  });

  // Chat Hook
  const { onRequest, messages } = useXChat({
    agent,
    requestPlaceholder: "Waiting...",
    requestFallback: "Sorry, I can not answer your question now",
  });

  // Event Handlers
  const handleSubmit = (nextContent: string) => {
    if (!nextContent) return;
    onRequest(nextContent);
    setContent(""); // Clear input after sending
  };

  // Placeholder for attachment button functionality
  const attachmentsNode = (
    <button
      className="btn btn-ghost btn-sm btn-circle"
      aria-label="Attach file"
    >
      <PaperClipIcon className="h-5 w-5" />
    </button>
    // TODO: Implement file attachment logic
  );

  const agentModalRef = React.useRef<HTMLDialogElement>(null); // Ref for main agent modal

  // Mock save function
  const handleSaveChanges = () => {
    console.log("Mock Save: Agent details would be saved here.");
    // In a real app, you'd collect form data and send it to the backend
    handleCloseAgentModal();
  };

  const handleOpenModal = () => {
    // setIconPreviewUrl(agent?.settings?.icon || null); // Reset preview on open
    agentModalRef.current?.showModal();
    // setIsModalOpen(true); // Not strictly needed if using ref.showModal()
  };

  const handleCloseAgentModal = () => {
    agentModalRef.current?.close();
    // setIsModalOpen(false);
  };

  const [items, setItems] = React.useState<ThoughtChainItem[]>(
    mockServerResponseData
  );
  const [loading, setLoading] = React.useState<boolean>(false);

  const mockStatusChange = async () => {
    // await updateChainItem('error');
    // setItems([...mockServerResponseData]);
    await updateChainItem("pending");
    setItems([...mockServerResponseData]);
    await updateChainItem("success");
    setItems([...mockServerResponseData]);
  };

  const onClick = async () => {
    setLoading(true);
    addChainItem();
    setItems([...mockServerResponseData]);
    await mockStatusChange();
    setLoading(false);
  };

  // Map messages for Bubble.List
  const bubbleItems: React.ComponentProps<typeof Bubble.List>["items"] =
    messages.map(({ id, message, status }) => ({
      key: id,
      loading: status === "loading",
      role: status === "local" ? "local" : "ai",
      content: message,
      footer:
        status === "local" ? (
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={handleOpenModal}
              className="btn btn-primary btn-sm"
            >
              <PlusCircleIcon className="h-4 w-4 mr-1" /> Add Trigger
            </button>
          </div>
        ) : (
          <ThoughtChain style={{ marginLeft: 16 }} items={items} />
        ),
      // loadingRender: () => <div>Custom loading...</div>,
    }));

  return (
    <div className="flex flex-col h-full">
      {" "}
      {/* Use flex column */}
      {/* Message List */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {" "}
        {/* Scrollable message area */}
        <Bubble.List
          items={bubbleItems}
          roles={roles}
          // className="messages" // Removed potentially conflicting class
        />
      </div>
      {/* Sender Input - Apply DaisyUI/Tailwind styling */}
      <div className="p-4 border-t border-base-300">
        <Sender
          value={content}
          onSubmit={handleSubmit}
          onChange={setContent}
          prefix={attachmentsNode} // Add attachment button
          loading={agent.isRequesting()}
          placeholder={`Chat with ${agentName}...`}
          // Apply styling via props if available, or wrap/style container
          styles={{
            // Basic styling for the input area
            input: {
              // Correct key for input styling
              border: "1px solid hsl(var(--bc) / 0.2)",
              borderRadius: "var(--rounded-btn, 0.5rem)",
              padding: "0.5rem 0.75rem", // Adjust padding as needed for input element
              minHeight: "40px", // Ensure minimum height
              boxShadow: "none", // Remove default shadow if any
            },
          }}
        />
      </div>
      <dialog id="agent_edit_modal" className="modal" ref={agentModalRef}>
        {" "}
        {/* Updated ref */}
        <div className="modal-box w-11/12 max-w-2xl">
          <h3 className="font-bold text-lg mb-4">Trigger Details</h3>

          {/* Form Fields */}
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Trigger Name</span>
            </label>
            {/* Added nullish coalescing for safety */}
            <input
              type="text"
              defaultValue={"王小二跟单"}
              className="input input-bordered w-full"
            />
          </div>

          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">MCP</span>
            </label>
            <select
              className="select select-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary"
              defaultValue="1"
            >
              <option value="1">X</option>
              <option value="2">KOL</option>
              <option value="3">Wallet</option>
              <option value="4">Candlestick Chart</option>
            </select>
          </div>

          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Schedule</span>
            </label>
            <select
              className="select select-bordered w-full focus:outline-none focus:ring-2 focus:ring-primary"
              defaultValue="1"
            >
              <option value="1">1 min</option>
              <option value="2">5 min</option>
              <option value="3">10 min</option>
              <option value="4">30 min</option>
              <option value="5">60 min</option>
            </select>
          </div>

          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Trigger Prompt</span>
            </label>
            <textarea
              className="textarea textarea-bordered h-32 w-full" // Increased height
              // Added nullish coalescing for safety
              defaultValue={"test"}
            ></textarea>
          </div>

          {/* Agent Modal Actions */}
          <div className="modal-action mt-6">
            <button className="btn btn-ghost" onClick={handleCloseAgentModal}>
              Cancel
            </button>{" "}
            {/* Renamed handler */}
            <button className="btn btn-primary" onClick={handleSaveChanges}>
              Save Changes
            </button>
          </div>

          {/* Agent Modal Close button */}
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={handleCloseAgentModal}
            aria-label="Close"
          >
            {" "}
            {/* Renamed handler */}
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        {/* Optional: Click backdrop to close */}
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
};

export default AgentChat; // Ensure the component is exported correctly
