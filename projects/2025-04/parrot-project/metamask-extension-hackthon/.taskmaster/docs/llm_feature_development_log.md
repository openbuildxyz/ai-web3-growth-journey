# MetaMask LLM 功能开发与调试日志

本文档记录了在 MetaMask 扩展中集成基于 LLM 的交易分析功能的开发流程和关键问题的解决方案。它可以作为未来开发或项目重建时的参考。

## 1. 项目目标

开发一个概念验证（PoC）功能，在用户交易确认页面上，提供一个"AI分析"按钮。点击后，调用大语言模型（LLM）API，分析当前交易的潜在风险，并将结果展示给用户。

## 2. 开发流程概要

1.  **初始化**: 使用 `taskmaster-ai` 工具初始化项目，并根据产品需求文档（PRD）生成了初始的12个开发任务。
2.  **环境配置**:
    *   解决了 `parse-prd` 因缺少 API 密钥而失败的问题。
    *   最终确定使用 `google/gemini-2.5-pro` 模型，并按照 PoC 要求将 API 密钥硬编码在服务类中。
3.  **核心功能实现**:
    *   **研究 (Task 1)**: 分析了代码库，确定 `ui/pages/confirmations/confirm/confirm.tsx` 是集成新功能的关键UI组件。
    *   **数据格式化 (Task 3)**: 创建了 `formatTransactionForLLM` 工具函数，用于从 `confirmation` 对象中提取和格式化数据，为 LLM 调用做准备。
    *   **API 服务 (Task 4)**: 创建了 `LlmTransactionAnalysisService` 类来封装对 OpenRouter API 的调用逻辑。
    *   **UI 集成 (Task 5)**: 将新的 React 组件 (`AnalysisButton`, `AnalysisResult`) 和服务调用逻辑集成到 `confirm.tsx` 中。
    *   **单元测试 (Task 10)**: 为 `formatTransactionForLLM` 和 `LlmTransactionAnalysisService` 编写了单元测试，并确保它们通过。
    *   **端到端测试 (Task 11)**: 开始搭建 E2E 测试，通过扩展现有的页面对象模型（Page Object Model）来支持新UI的自动化测试。

## 3. 遇到的关键错误及解决方案

在开发过程中，我们遇到了几个典型的错误，以下是它们的详细记录和解决方法。

### 错误 1: `TypeError: _llmAnalysisService.default is not a constructor`

*   **现象**: 在 `confirm.tsx` 中实例化服务时程序崩溃。
*   **根本原因**: 模块导入/导出方式不匹配。`llm-analysis-service.ts` 文件使用了命名导出 (`export class ...`)，而在 `confirm.tsx` 中却错误地使用了默认导入 (`import Llm... from ...`)。
*   **解决方案**:
    1.  **修正导入语句**: 将 `confirm.tsx` 中的导入语句从 `import LlmTransactionAnalysisService from ...` 修改为 `import { LlmTransactionAnalysisService } from ...`，使用花括号进行命名导入。
    2.  **增强健壮性**: 修改了 `LlmTransactionAnalysisService` 的 `constructor`，为其参数提供了默认值。这样，即使在实例化时没有传递参数（如此处场景），它也能正常工作。

### 错误 2: `Argument of type 'TransactionMeta' is not assignable to 'Confirmation'`

*   **现象**: 在调用 `formatTransactionForLLM(currentConfirmation)` 时出现 TypeScript 类型错误。
*   **根本原因**: 我们自定义的 `Confirmation` 接口与 MetaMask 实际提供的 `TransactionMeta` 对象类型不完全匹配。具体来说，`txParams.value` 字段在实际对象中是可选的 (`string | undefined`)，而我们的接口中被定义为必需的 (`string`)。
*   **解决方案**: 将 `ui/pages/confirmations/utils/llm-analytics.util.ts` 文件中的 `TxParams` 接口定义从 `value: string;` 修改为 `value?: string;`，使其与上游数据类型保持一致。

### 错误 3: `SyntaxError: Unexpected token '`'` (解析 LLM 响应失败)

*   **现象**: `JSON.parse()` 在尝试解析从 LLM API 返回的响应时失败。
*   **根本原因**: LLM 返回的并非纯净的 JSON 字符串，而是将 JSON 包裹在了一个 Markdown 代码块中 (例如：` ```json\n{...}\n``` `)。
*   **解决方案**: 改进了 `llm-analysis-service.ts` 中的 `parseResponse` 函数。在调用 `JSON.parse()` 之前，先使用正则表达式 ` / \`\`\`json\s*([\s\S]*?)\s*\`\`\` / ` 来匹配并提取出 Markdown 块内部的纯净 JSON 字符串。

这些修复步骤使功能最终得以成功运行。