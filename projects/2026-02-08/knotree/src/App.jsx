import React, { useReducer, useState, useMemo, useCallback } from "react";
import { THEME } from "./theme";
import {
  treeReducer,
  initialState,
  computeLayout,
  exportToMarkdown,
} from "./store/treeStore";
import { generateSubtopics, searchWithLLM } from "./services/llm";
import { searchWithTavily } from "./services/tavily";
import TreeCanvas from "./components/TreeCanvas";
import {
  NodeDetail,
  PrunedPanel,
  LogPanel,
  ExportModal,
} from "./components/Panels";

// ─── Welcome Screen ───
function WelcomeScreen({ topic, setTopic, onSubmit, isLoading }) {
  const suggestions = ["机器学习", "气候变化", "量子计算", "区块链", "文艺复兴"];
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        animation: "fadeIn 0.8s ease",
      }}
    >
      <div style={{ fontSize: 64 }}>🌱</div>
      <div style={{ fontSize: 20, fontWeight: 600, color: THEME.primary }}>
        种下一颗知识的种子
      </div>
      <div
        style={{
          fontSize: 13,
          color: THEME.textDim,
          maxWidth: 360,
          textAlign: "center",
          lineHeight: 1.6,
        }}
      >
        输入任何你想探索的主题，KnoTree 会帮你拆解为子话题，
        生成一棵可以不断生长、修剪的知识树。
      </div>
      <div
        style={{
          display: "flex",
          gap: 8,
          marginTop: 8,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {suggestions.map((t) => (
          <button
            key={t}
            onClick={() => setTopic(t)}
            style={{
              padding: "6px 14px",
              borderRadius: 20,
              background: "rgba(255,255,255,0.7)",
              border: `1px solid ${THEME.inputBorder}`,
              color: THEME.textDim,
              cursor: "pointer",
              fontSize: 12,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = THEME.primary;
              e.target.style.color = THEME.primary;
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = THEME.inputBorder;
              e.target.style.color = THEME.textDim;
            }}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main App ───
export default function App() {
  const [state, dispatch] = useReducer(treeReducer, initialState);
  const [topic, setTopic] = useState("");
  const [isInitializing, setIsInitializing] = useState(false);
  const [loadingNodeId, setLoadingNodeId] = useState(null);
  const [loadingState, setLoadingState] = useState(null);
  const [showExport, setShowExport] = useState(false);
  const [exportMd, setExportMd] = useState("");

  // Search mode: "tavily" uses Tavily API (recommended), "llm" uses LLM as fallback
  const [searchMode, setSearchMode] = useState("tavily");

  // Compute positions
  const { viewW, viewH } = useMemo(() => {
    const visible = Object.values(state.treeNodes).filter(
      (n) => n.status !== "pruned"
    );
    const count = visible.length;
    const maxDepth = visible.reduce((m, n) => Math.max(m, n.depth || 0), 0);
    const levelH = 180;
    const rootPad = 70;
    const topPad = 80;
    return {
      viewW: Math.max(1100, count * 120),
      viewH: Math.max(720, maxDepth * levelH + rootPad + topPad),
    };
  }, [state.treeNodes]);

  const positions = useMemo(
    () => computeLayout(state.treeNodes, state.rootId, viewW, viewH),
    [state.treeNodes, state.rootId, viewW, viewH]
  );

  // ─── Actions ───
  const handleInit = useCallback(async () => {
    if (!topic.trim() || isInitializing) return;
    setIsInitializing(true);
    const subtopics = await generateSubtopics(topic.trim());
    if (subtopics) {
      dispatch({
        type: "INIT_TREE",
        payload: { topic: topic.trim(), children: subtopics },
      });
    } else {
      alert(
        "生成失败，请确认后端服务可访问，并检查 MODELSCOPE_API_KEY 是否正确"
      );
    }
    setIsInitializing(false);
  }, [topic, isInitializing]);

  const handleGrow = useCallback(
    async (nodeId) => {
      const node = state.treeNodes[nodeId];
      if (!node) return;
      setLoadingNodeId(nodeId);
      setLoadingState("growing");
      // Build path for context
      const path = [];
      let cur = node;
      while (cur) {
        path.unshift(cur.label);
        cur = state.treeNodes[cur.parentId];
      }
      const subtopics = await generateSubtopics(node.label, path.join(" > "));
      if (subtopics) {
        dispatch({
          type: "GROW_NODE",
          payload: { nodeId, newChildren: subtopics },
        });
      }
      setLoadingNodeId(null);
      setLoadingState(null);
    },
    [state.treeNodes]
  );

  const handleSearch = useCallback(
    async (nodeId) => {
      const node = state.treeNodes[nodeId];
      if (!node) return;
      setLoadingNodeId(nodeId);
      setLoadingState("searching");

      let resources = null;
      if (searchMode === "tavily") {
        resources = await searchWithTavily(node.label);
      }
      // Fallback to LLM if Tavily fails or mode is llm
      if (!resources) {
        resources = await searchWithLLM(node.label);
      }

      if (resources) {
        dispatch({
          type: "ADD_SOURCES",
          payload: { nodeId, sources: resources },
        });
      }
      setLoadingNodeId(null);
      setLoadingState(null);
    },
    [state.treeNodes, searchMode]
  );

  const handleExport = useCallback(() => {
    const md = exportToMarkdown(state.treeNodes, state.rootId);
    setExportMd(md);
    setShowExport(true);
  }, [state.treeNodes, state.rootId]);

  const selectedNode = state.selectedNodeId
    ? state.treeNodes[state.selectedNodeId]
    : null;

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        background: THEME.bg,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        color: THEME.textMain,
        position: "relative",
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${THEME.nodeBorder}; border-radius: 4px; }
      `}</style>

      {/* ─── Header ─── */}
      <div
        style={{
          padding: "14px 22px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          border: `1px solid ${THEME.glassBorder}`,
          background: THEME.glass,
          backdropFilter: "blur(14px)",
          zIndex: 10,
          flexShrink: 0,
          margin: "16px auto 8px",
          borderRadius: 18,
          boxShadow: "0 12px 30px rgba(41, 50, 30, 0.12)",
          width: "min(980px, 94%)",
        }}
      >
        <div style={{ fontSize: 22 }}>🌳</div>
        <div
          style={{
            fontSize: 17,
            fontWeight: 600,
            letterSpacing: 1,
            color: THEME.primary,
          }}
        >
          KnoTree
        </div>

        {!state.rootId ? (
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              flex: 1,
              maxWidth: 500,
              marginLeft: 16,
            }}
          >
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleInit()}
              placeholder="输入一个主题开始探索... Enter a topic..."
              style={{
                flex: 1,
                padding: "8px 14px",
                borderRadius: 10,
                background: THEME.inputBg,
                border: `1px solid ${THEME.inputBorder}`,
                color: THEME.textMain,
                fontSize: 13,
                outline: "none",
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.2)",
              }}
              onFocus={(e) => (e.target.style.borderColor = THEME.primary)}
              onBlur={(e) =>
                (e.target.style.borderColor = THEME.inputBorder)
              }
            />
            <button
              onClick={handleInit}
              disabled={isInitializing || !topic.trim()}
              style={{
                padding: "8px 18px",
                borderRadius: 10,
                background: isInitializing
                  ? THEME.primaryDim
                  : THEME.btnPrimary,
                color: "#fff",
                border: "none",
                cursor: isInitializing ? "wait" : "pointer",
                fontSize: 13,
                fontWeight: 500,
                whiteSpace: "nowrap",
                boxShadow: "0 6px 14px rgba(74,93,35,0.18)",
              }}
            >
              {isInitializing ? "🌱 生成中..." : "🌱 种下种子"}
            </button>
          </div>
        ) : (
          <>
            <div style={{ flex: 1 }} />
            <div
              style={{ fontSize: 12.5, color: THEME.textDim }}
            >
              🌳 {state.treeNodes[state.rootId]?.label}
              <span style={{ marginLeft: 8, color: THEME.primaryDim }}>
                {
                  Object.values(state.treeNodes).filter(
                    (n) => n.status !== "pruned"
                  ).length
                }{" "}
                节点
              </span>
            </div>

            {/* Search mode toggle */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                marginLeft: 12,
                fontSize: 10.5,
                color: THEME.textDim,
              }}
            >
              <span>搜索:</span>
              <button
                onClick={() => setSearchMode("tavily")}
                style={{
                  padding: "3px 8px",
                  borderRadius: 6,
                  border: `1px solid ${
                    searchMode === "tavily"
                      ? THEME.primary
                      : THEME.inputBorder
                  }`,
                  background:
                    searchMode === "tavily"
                      ? "rgba(143,188,143,0.2)"
                      : "rgba(255,255,255,0.6)",
                  color:
                    searchMode === "tavily" ? THEME.primary : THEME.textDim,
                  cursor: "pointer",
                  fontSize: 10.5,
                }}
              >
                Tavily
              </button>
              <button
                onClick={() => setSearchMode("llm")}
                style={{
                  padding: "3px 8px",
                  borderRadius: 6,
                  border: `1px solid ${
                    searchMode === "llm"
                      ? THEME.primary
                      : THEME.inputBorder
                  }`,
                  background:
                    searchMode === "llm"
                      ? "rgba(143,188,143,0.2)"
                      : "rgba(255,255,255,0.6)",
                  color:
                    searchMode === "llm" ? THEME.primary : THEME.textDim,
                  cursor: "pointer",
                  fontSize: 10.5,
                }}
              >
                LLM
              </button>
            </div>

            <button
              onClick={handleExport}
              style={{
                padding: "6px 12px",
                borderRadius: 8,
                background: THEME.inputBg,
                border: `1px solid ${THEME.inputBorder}`,
                color: THEME.textMain,
                cursor: "pointer",
                fontSize: 11.5,
                marginLeft: 8,
                boxShadow: "0 6px 14px rgba(41, 50, 30, 0.12)",
              }}
            >
              🍎 导出
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "6px 12px",
                borderRadius: 8,
                background: THEME.inputBg,
                border: `1px solid ${THEME.inputBorder}`,
                color: THEME.textMain,
                cursor: "pointer",
                fontSize: 11.5,
                boxShadow: "0 6px 14px rgba(41, 50, 30, 0.12)",
              }}
            >
              🔄 重置
            </button>
          </>
        )}
      </div>

      {/* ─── Content ─── */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {!state.rootId ? (
          <WelcomeScreen
            topic={topic}
            setTopic={setTopic}
            onSubmit={handleInit}
            isLoading={isInitializing}
          />
        ) : (
          <>
            <TreeCanvas
              treeNodes={state.treeNodes}
              rootId={state.rootId}
              positions={positions}
              selectedNodeId={state.selectedNodeId}
              loadingNodeId={loadingNodeId}
              onSelectNode={(id) =>
                dispatch({ type: "SELECT_NODE", payload: id })
              }
            />

            <NodeDetail
              node={selectedNode}
              treeNodes={state.treeNodes}
              onGrow={() => handleGrow(state.selectedNodeId)}
              onSearch={() => handleSearch(state.selectedNodeId)}
              onPrune={() =>
                dispatch({
                  type: "PRUNE_NODE",
                  payload: state.selectedNodeId,
                })
              }
              onRestore={() =>
                dispatch({
                  type: "RESTORE_NODE",
                  payload: state.selectedNodeId,
                })
              }
              onDeselect={() =>
                dispatch({ type: "SELECT_NODE", payload: null })
              }
              loadingState={
                loadingNodeId === state.selectedNodeId ? loadingState : null
              }
            />

            <PrunedPanel
              treeNodes={state.treeNodes}
              onRestore={(id) =>
                dispatch({ type: "RESTORE_NODE", payload: id })
              }
            />

            <LogPanel actionLog={state.actionLog} />
          </>
        )}
      </div>

      {/* ─── Export Modal ─── */}
      {showExport && (
        <ExportModal
          markdown={exportMd}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  );
}
