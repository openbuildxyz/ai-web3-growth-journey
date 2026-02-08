import React, { useRef, useState, useCallback } from "react";
import { THEME } from "../theme";
import "../treeCanvas.css";

const EDGE_COLORS = {
  root: { start: "#4A5D23", end: "#6F7F3A" },
  branch: { start: "#556B2F", end: "#8FBC8F" },
  leaf: { start: "#8FBC8F", end: "#CDE7C0" },
};

const getEdgeStyle = (depth) => {
  if (depth <= 0) {
    return { width: 8, colors: EDGE_COLORS.root };
  }
  if (depth === 1) {
    return { width: 5, colors: EDGE_COLORS.branch };
  }
  return { width: 1.5, colors: EDGE_COLORS.leaf };
};

const buildBezierPath = (x1, y1, x2, y2) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const curve = 0.35;
  const c1x = x1 + dx * 0.25;
  const c1y = y1 + dy * curve;
  const c2x = x2 - dx * 0.25;
  const c2y = y2 - dy * curve;
  return `M ${x1} ${y1} C ${c1x} ${c1y} ${c2x} ${c2y} ${x2} ${y2}`;
};

function BranchLine({ path, strokeWidth, stroke, isPruned }) {
  return (
    <path
      d={path}
      stroke={stroke}
      strokeWidth={strokeWidth}
      fill="none"
      strokeLinecap="round"
      opacity={isPruned ? 0.25 : 0.9}
      style={{
        filter: isPruned
          ? "none"
          : "drop-shadow(0 1px 2px rgba(74,93,35,0.18))",
      }}
    />
  );
}

function TreeNodeSVG({
  node,
  x,
  y,
  isSelected,
  onSelect,
  isLoading,
  isHovered,
  onHover,
}) {
  const isPruned = node.status === "pruned";
  const isRoot = node.nodeType === "root";
  const isLeaf = node.nodeType === "leaf";

  const cardW = 220;
  const cardH = node.summary ? 110 : 86;

  const label = node.label || "";
  const summary = node.summary || "";

  const cardX = x - cardW / 2;
  const cardY = isRoot ? y - cardH - 28 : y - cardH / 2;

  return (
    <g
      onClick={(e) => {
        e.stopPropagation();
        onSelect(node.id);
      }}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={() => onHover(null)}
      style={{ cursor: "pointer" }}
    >
      {isRoot && (
        <g>
          <circle
            cx={x}
            cy={y}
            r={26}
            fill={THEME.nodeBg}
            stroke={THEME.trunk}
            strokeWidth={2.5}
          />
          <circle
            cx={x}
            cy={y}
            r={14}
            fill="none"
            stroke={THEME.branchThin}
            strokeWidth={1}
          />
        </g>
      )}

      {!isLeaf && (
        <foreignObject x={cardX} y={cardY} width={cardW} height={cardH}>
          <div
            xmlns="http://www.w3.org/1999/xhtml"
            className={`node-card ${isSelected ? "is-selected" : ""} ${
              isPruned ? "is-pruned" : ""
            }`}
            style={{ pointerEvents: "all" }}
          >
            <div className="node-title">{label}</div>
            {summary && <div className="node-summary">{summary}</div>}
            <div className="node-tooltip">
              <div className="node-tooltip-title">{label}</div>
              {summary && (
                <div className="node-tooltip-summary">{summary}</div>
              )}
            </div>
          </div>
        </foreignObject>
      )}

      {isLeaf && (
        <g>
          <path
            d={`M ${x} ${y - 12}
              C ${x + 18} ${y - 8} ${x + 18} ${y + 8} ${x} ${y + 14}
              C ${x - 18} ${y + 8} ${x - 18} ${y - 8} ${x} ${y - 12} Z`}
            fill={THEME.leafGreen}
            opacity={isPruned ? 0.4 : 0.95}
            stroke={THEME.branchThin}
            strokeWidth={1}
          />
          <path
            d={`M ${x} ${y - 9} L ${x} ${y + 10}`}
            stroke="rgba(74,93,35,0.35)"
            strokeWidth={1}
          />
          {isSelected && (
            <circle
              cx={x}
              cy={y}
              r={16}
              fill="none"
              stroke={THEME.selectedBorder}
              strokeWidth={1.5}
              opacity={0.6}
            />
          )}
          {isHovered && (
            <foreignObject x={x - 110} y={y - 120} width={220} height={100}>
              <div
                xmlns="http://www.w3.org/1999/xhtml"
                className="leaf-tooltip"
                style={{ pointerEvents: "none" }}
              >
                <div className="node-title">{label}</div>
                {summary && <div className="node-summary">{summary}</div>}
              </div>
            </foreignObject>
          )}
        </g>
      )}

      {isLoading && (
        <circle
          cx={x}
          cy={y}
          r={isRoot ? 30 : 22}
          fill="none"
          stroke={THEME.accent}
          strokeWidth={2}
          strokeDasharray="6 4"
          opacity={0.7}
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from={`0 ${x} ${y}`}
            to={`360 ${x} ${y}`}
            dur="3s"
            repeatCount="indefinite"
          />
        </circle>
      )}
    </g>
  );
}

export default function TreeCanvas({
  treeNodes,
  rootId,
  positions,
  selectedNodeId,
  loadingNodeId,
  onSelectNode,
}) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: 900, h: 600 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [hoveredId, setHoveredId] = useState(null);

  React.useEffect(() => {
    if (!rootId) return;
    const visible = Object.values(treeNodes).filter(
      (n) => n.status !== "pruned"
    );
    const maxDepth = Math.max(0, ...visible.map((n) => n.depth));
    const neededH = maxDepth * 180 + 160;
    const neededW = Math.max(1100, visible.length * 120);
    setViewBox((v) => ({
      ...v,
      w: Math.max(v.w, neededW),
      h: Math.max(v.h, neededH),
    }));
  }, [treeNodes, rootId]);

  const handleMouseDown = useCallback((e) => {
    setIsPanning(true);
    setPanStart({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback(
    (e) => {
      if (!isPanning) return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const dx = (e.clientX - panStart.x) * (viewBox.w / rect.width);
      const dy = (e.clientY - panStart.y) * (viewBox.h / rect.height);
      setViewBox((v) => ({ ...v, x: v.x - dx, y: v.y - dy }));
      setPanStart({ x: e.clientX, y: e.clientY });
    },
    [isPanning, panStart, viewBox]
  );

  const handleMouseUp = useCallback(() => setIsPanning(false), []);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const scale = e.deltaY > 0 ? 1.08 : 0.92;
    setViewBox((v) => {
      const nw = v.w * scale;
      const nh = v.h * scale;
      return {
        x: v.x + (v.w - nw) / 2,
        y: v.y + (v.h - nh) / 2,
        w: nw,
        h: nh,
      };
    });
  }, []);

  const edges = [];
  const edgeGradients = [];
  Object.values(treeNodes).forEach((node) => {
    node.children.forEach((cid) => {
      const child = treeNodes[cid];
      if (child && positions[node.id] && positions[cid]) {
        const key = `${node.id}-${cid}`;
        const { width, colors } = getEdgeStyle(node.depth);
        const gradId = `edge-grad-${key}`;
        edges.push({
          key,
          path: buildBezierPath(
            positions[node.id].x,
            positions[node.id].y,
            positions[cid].x,
            positions[cid].y
          ),
          stroke: `url(#${gradId})`,
          strokeWidth: width,
          isPruned: child.status === "pruned",
        });
        edgeGradients.push({
          id: gradId,
          x1: positions[node.id].x,
          y1: positions[node.id].y,
          x2: positions[cid].x,
          y2: positions[cid].y,
          start: colors.start,
          end: colors.end,
        });
      }
    });
  });

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%", overflow: "hidden" }}>
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ cursor: isPanning ? "grabbing" : "grab" }}
      >
        <rect
          data-bg="true"
          x={viewBox.x - 2000}
          y={viewBox.y - 2000}
          width={viewBox.w + 4000}
          height={viewBox.h + 4000}
          fill={THEME.canvasBg}
        />

        <defs>
          <filter id="paperNoise" x="0" y="0" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.8"
              numOctaves="2"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncA type="table" tableValues="0 0.04" />
            </feComponentTransfer>
          </filter>
          <pattern
            id="dots"
            x="0"
            y="0"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="20" cy="20" r="0.6" fill="rgba(44,62,80,0.08)" />
          </pattern>
          {edgeGradients.map((grad) => (
            <linearGradient
              key={grad.id}
              id={grad.id}
              gradientUnits="userSpaceOnUse"
              x1={grad.x1}
              y1={grad.y1}
              x2={grad.x2}
              y2={grad.y2}
            >
              <stop offset="0%" stopColor={grad.start} stopOpacity="0.95" />
              <stop offset="100%" stopColor={grad.end} stopOpacity="0.7" />
            </linearGradient>
          ))}
        </defs>

        <rect
          x={viewBox.x - 2000}
          y={viewBox.y - 2000}
          width={viewBox.w + 4000}
          height={viewBox.h + 4000}
          filter="url(#paperNoise)"
          opacity={0.35}
        />
        <rect
          x={viewBox.x - 2000}
          y={viewBox.y - 2000}
          width={viewBox.w + 4000}
          height={viewBox.h + 4000}
          fill="url(#dots)"
        />

        {edges.map((edge) => (
          <BranchLine
            key={edge.key}
            path={edge.path}
            stroke={edge.stroke}
            strokeWidth={edge.strokeWidth}
            isPruned={edge.isPruned}
          />
        ))}

        {Object.values(treeNodes).map((node) => {
          const pos = positions[node.id];
          if (!pos) return null;
          return (
            <TreeNodeSVG
              key={node.id}
              node={node}
              x={pos.x}
              y={pos.y}
              isSelected={selectedNodeId === node.id}
              onSelect={onSelectNode}
              isLoading={loadingNodeId === node.id}
              isHovered={hoveredId === node.id}
              onHover={setHoveredId}
            />
          );
        })}
      </svg>
    </div>
  );
}
