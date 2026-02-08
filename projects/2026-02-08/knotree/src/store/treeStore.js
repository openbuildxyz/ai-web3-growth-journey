// ─── Tree State ───

export const initialState = {
  treeNodes: {},
  rootId: null,
  selectedNodeId: null,
  actionLog: [],
};

export function treeReducer(state, action) {
  switch (action.type) {
    case "INIT_TREE": {
      const rootId = "root";
      const children = action.payload.children.map((child, i) => {
        const id = `n-${Date.now()}-${i}`;
        return {
          id,
          label: child.label,
          summary: child.summary || "",
          status: "idle",
          children: [],
          sources: [],
          depth: 1,
          parentId: rootId,
          nodeType: "branch",
        };
      });
      const rootNode = {
        id: rootId,
        label: action.payload.topic,
        summary: "",
        status: "growing",
        children: children.map((c) => c.id),
        sources: [],
        depth: 0,
        parentId: null,
        nodeType: "root",
      };
      const nodes = { [rootId]: rootNode };
      children.forEach((c) => (nodes[c.id] = c));
      return {
        ...state,
        rootId,
        treeNodes: nodes,
        selectedNodeId: null,
        actionLog: [
          { type: "init", topic: action.payload.topic, ts: Date.now() },
        ],
      };
    }

    case "SELECT_NODE":
      return { ...state, selectedNodeId: action.payload };

    case "GROW_NODE": {
      const { nodeId, newChildren } = action.payload;
      const parent = state.treeNodes[nodeId];
      if (!parent) return state;
      const childNodes = newChildren.map((child, i) => ({
        id: `n-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 5)}`,
        label: child.label,
        summary: child.summary || "",
        status: "idle",
        children: [],
        sources: [],
        depth: parent.depth + 1,
        parentId: nodeId,
        nodeType: "branch",
      }));
      const updated = {
        ...parent,
        status: "growing",
        children: [...parent.children, ...childNodes.map((c) => c.id)],
      };
      const newNodes = { ...state.treeNodes, [nodeId]: updated };
      childNodes.forEach((c) => (newNodes[c.id] = c));
      return {
        ...state,
        treeNodes: newNodes,
        actionLog: [
          ...state.actionLog,
          { type: "grow", nodeId, ts: Date.now() },
        ],
      };
    }

    case "ADD_SOURCES": {
      const { nodeId, sources } = action.payload;
      const node = state.treeNodes[nodeId];
      if (!node) return state;
      const sourceNodes = sources.map((s, i) => ({
        id: `src-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 5)}`,
        label: s.title,
        summary: s.snippet || "",
        status: "idle",
        children: [],
        sources: [{ title: s.title, url: s.url }],
        depth: node.depth + 1,
        parentId: nodeId,
        nodeType: "leaf",
      }));
      const updated = {
        ...node,
        status: "growing",
        children: [...node.children, ...sourceNodes.map((c) => c.id)],
      };
      const newNodes = { ...state.treeNodes, [nodeId]: updated };
      sourceNodes.forEach((c) => (newNodes[c.id] = c));
      return {
        ...state,
        treeNodes: newNodes,
        actionLog: [
          ...state.actionLog,
          { type: "search", nodeId, count: sources.length, ts: Date.now() },
        ],
      };
    }

    case "PRUNE_NODE": {
      const pruneId = action.payload;
      const node = state.treeNodes[pruneId];
      if (!node || node.depth === 0) return state;
      // Collect all descendants
      const toPrune = new Set();
      const queue = [pruneId];
      while (queue.length) {
        const id = queue.shift();
        toPrune.add(id);
        const n = state.treeNodes[id];
        if (n) queue.push(...n.children);
      }
      const newNodes = { ...state.treeNodes };
      toPrune.forEach((id) => {
        newNodes[id] = { ...newNodes[id], status: "pruned" };
      });
      return {
        ...state,
        treeNodes: newNodes,
        selectedNodeId:
          state.selectedNodeId === pruneId ? null : state.selectedNodeId,
        actionLog: [
          ...state.actionLog,
          { type: "prune", nodeId: pruneId, ts: Date.now() },
        ],
      };
    }

    case "RESTORE_NODE": {
      const restoreId = action.payload;
      const toRestore = new Set();
      const queue = [restoreId];
      while (queue.length) {
        const id = queue.shift();
        toRestore.add(id);
        const n = state.treeNodes[id];
        if (n) queue.push(...n.children);
      }
      const newNodes = { ...state.treeNodes };
      toRestore.forEach((id) => {
        const n = newNodes[id];
        newNodes[id] = {
          ...n,
          status: n.children.length > 0 ? "growing" : "idle",
        };
      });
      return {
        ...state,
        treeNodes: newNodes,
        actionLog: [
          ...state.actionLog,
          { type: "restore", nodeId: restoreId, ts: Date.now() },
        ],
      };
    }

    default:
      return state;
  }
}

// ─── Tree Layout Algorithm ───

export function computeLayout(treeNodes, rootId, width, height) {
  if (!rootId || !treeNodes[rootId]) return {};
  const positions = {};
  const LEVEL_H = 180;
  const ROOT_PAD = 70;
  const SIDE_PAD = 90;
  const MIN_GAP = 120;
  const rootY = Math.max(ROOT_PAD + LEVEL_H, height - ROOT_PAD);

  function countVisible(id) {
    const node = treeNodes[id];
    if (!node) return 0;
    const vis = node.children.filter(
      (cid) => treeNodes[cid]?.status !== "pruned"
    );
    if (vis.length === 0) return 1;
    return vis.reduce((s, cid) => s + countVisible(cid), 0);
  }

  function layout(id, left, right, depth) {
    const node = treeNodes[id];
    if (!node) return;
    const x = (left + right) / 2;
    const y = rootY - depth * LEVEL_H;
    positions[id] = { x, y };
    const vis = node.children.filter(
      (cid) => treeNodes[cid]?.status !== "pruned"
    );
    if (vis.length === 0) return;
    const totalLeaves = vis.reduce((s, cid) => s + countVisible(cid), 0);
    const w = right - left;
    let cursor = left;
    vis.forEach((cid) => {
      const share = countVisible(cid) / totalLeaves;
      layout(cid, cursor, cursor + w * share, depth + 1);
      cursor += w * share;
    });
  }

  layout(rootId, SIDE_PAD, width - SIDE_PAD, 0);

  const depthMap = {};
  Object.values(treeNodes).forEach((node) => {
    if (!positions[node.id] || node.status === "pruned") return;
    if (!depthMap[node.depth]) depthMap[node.depth] = [];
    depthMap[node.depth].push(node.id);
  });

  Object.values(depthMap).forEach((ids) => {
    ids.sort((a, b) => positions[a].x - positions[b].x);
    for (let i = 1; i < ids.length; i += 1) {
      const prev = positions[ids[i - 1]];
      const curr = positions[ids[i]];
      if (curr.x - prev.x < MIN_GAP) {
        curr.x = prev.x + MIN_GAP;
      }
    }
  });

  return positions;
}

// ─── Export ───

export function exportToMarkdown(treeNodes, rootId) {
  if (!rootId) return "";
  let md = "";
  function walk(id, indent) {
    const node = treeNodes[id];
    if (!node || node.status === "pruned") return;
    const prefix =
      indent === 0 ? "# " : indent === 1 ? "## " : "  ".repeat(indent - 1) + "- ";
    md += `${prefix}${node.label}\n`;
    if (node.summary) md += `${"  ".repeat(Math.max(0, indent))}${node.summary}\n`;
    if (node.sources?.length > 0) {
      node.sources.forEach((s) => {
        md += `${"  ".repeat(Math.max(0, indent))}  - [${s.title}](${s.url})\n`;
      });
    }
    md += "\n";
    node.children.forEach((cid) => walk(cid, indent + 1));
  }
  walk(rootId, 0);
  return md;
}
