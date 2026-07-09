"use client";

import { useEffect, useRef } from "react";

/**
 * Live prerequisite-graph visualization for the hero. Ported from
 * design/hero.html (vanilla canvas) into a React component using the same
 * node / edge / pulse model: topics are nodes, prerequisite edges are lines,
 * and a travelling pulse shows a topic unlocking once its prerequisite is
 * mastered. Respects prefers-reduced-motion.
 */
type NodeState = "mastered" | "unlocked" | "locked";

interface GraphNode {
  id: number;
  cluster: number;
  ox: number;
  oy: number;
  x: number;
  y: number;
  cx: number;
  cy: number;
  r: number;
  bobPhase: number;
  bobSpeed: number;
  bobAmp: number;
  state: NodeState;
  isRoot: boolean;
}

interface GraphEdge {
  from: GraphNode;
  to: GraphNode;
  animating: boolean;
  progress: number;
}

const CLUSTERS = [
  { label: "BIO 301 · CELLULAR RESPIRATION", fx: 0.62, fy: 0.28, count: 16 },
  { label: "CHM 210 · REACTION KINETICS", fx: 0.85, fy: 0.62, count: 15 },
  { label: "MTH 204 · LINEAR SYSTEMS", fx: 0.55, fy: 0.8, count: 16 },
];

export default function GraphHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const cnv: HTMLCanvasElement = canvas;
    const host = canvas.parentElement as HTMLElement;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let W = 0,
      H = 0,
      DPR = 1;
    let nodes: GraphNode[] = [];
    let edges: GraphEdge[] = [];
    let crossEdges: { from: GraphNode; to: GraphNode }[] = [];
    let rafId = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const clusters = CLUSTERS.map((c) => ({ ...c, cx: 0, cy: 0 }));

    function buildGraph() {
      nodes = [];
      edges = [];
      let idCounter = 0;
      clusters.forEach((cl, ci) => {
        const clusterNodes: GraphNode[] = [];
        for (let i = 0; i < cl.count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.pow(Math.random(), 0.6);
          const node: GraphNode = {
            id: idCounter++,
            cluster: ci,
            ox: Math.cos(angle) * dist,
            oy: Math.sin(angle) * dist,
            x: 0,
            y: 0,
            cx: 0,
            cy: 0,
            r: 3.4,
            bobPhase: Math.random() * Math.PI * 2,
            bobSpeed: 0.4 + Math.random() * 0.3,
            bobAmp: 6 + Math.random() * 6,
            state: i === 0 ? "mastered" : "locked",
            isRoot: i === 0,
          };
          clusterNodes.push(node);
          nodes.push(node);
        }
        for (let i = 1; i < clusterNodes.length; i++) {
          const maxBack = Math.min(i, 3);
          const backIdx = i - 1 - Math.floor(Math.random() * maxBack);
          edges.push({
            from: clusterNodes[Math.max(0, backIdx)],
            to: clusterNodes[i],
            animating: false,
            progress: 0,
          });
          if (Math.random() < 0.28 && i > 2) {
            const extra = Math.floor(Math.random() * (i - 1));
            if (extra !== backIdx) {
              edges.push({
                from: clusterNodes[extra],
                to: clusterNodes[i],
                animating: false,
                progress: 0,
              });
            }
          }
        }
      });

      crossEdges = [
        { from: nodes[3], to: nodes[clusters[0].count + 5] },
        {
          from: nodes[clusters[0].count + 2],
          to: nodes[clusters[0].count + clusters[1].count + 4],
        },
      ];
    }

    function layout() {
      const spread = Math.min(W, H) * 0.16;
      clusters.forEach((cl) => {
        cl.cx = cl.fx * W;
        cl.cy = cl.fy * H;
      });
      nodes.forEach((n) => {
        const cl = clusters[n.cluster];
        n.cx = cl.cx + n.ox * spread;
        n.cy = cl.cy + n.oy * spread;
      });
    }

    function resize() {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = host.clientWidth;
      H = host.clientHeight;
      cnv.width = W * DPR;
      cnv.height = H * DPR;
      cnv.style.width = W + "px";
      cnv.style.height = H + "px";
      ctx!.setTransform(DPR, 0, 0, DPR, 0, 0);
      layout();
    }

    function tryAdvance() {
      clusters.forEach((_, ci) => {
        const active = edges.some((e) => e.animating && e.from.cluster === ci);
        if (active) return;
        const candidates = edges.filter(
          (e) =>
            e.from.cluster === ci &&
            e.from.state === "mastered" &&
            e.to.state === "locked" &&
            !e.animating,
        );
        if (candidates.length) {
          const pick = candidates[Math.floor(Math.random() * candidates.length)];
          pick.animating = true;
          pick.progress = 0;
        } else {
          const clusterNodes = nodes.filter((n) => n.cluster === ci);
          if (clusterNodes.every((n) => n.state === "mastered")) {
            timers.push(
              setTimeout(() => {
                clusterNodes.forEach((n) => {
                  if (!n.isRoot) n.state = "locked";
                });
              }, 2600),
            );
          }
        }
      });
    }

    function colorForState(state: NodeState, alpha: number) {
      if (state === "mastered") return `rgba(232,179,76,${alpha})`;
      if (state === "unlocked") return `rgba(143,217,232,${alpha})`;
      return `rgba(60,68,88,${alpha})`;
    }

    let last = performance.now();
    function frame(now: number) {
      const dt = Math.min(now - last, 50);
      last = now;
      ctx!.clearRect(0, 0, W, H);

      const t = now / 1000;
      nodes.forEach((n) => {
        n.x = n.cx + Math.sin(t * n.bobSpeed + n.bobPhase) * n.bobAmp;
        n.y = n.cy + Math.cos(t * n.bobSpeed * 0.8 + n.bobPhase) * n.bobAmp * 0.6;
      });

      ctx!.setLineDash([2, 5]);
      crossEdges.forEach((e) => {
        ctx!.strokeStyle = "rgba(143,217,232,0.10)";
        ctx!.lineWidth = 1;
        ctx!.beginPath();
        ctx!.moveTo(e.from.x, e.from.y);
        ctx!.lineTo(e.to.x, e.to.y);
        ctx!.stroke();
      });
      ctx!.setLineDash([]);

      edges.forEach((e) => {
        const bothLocked =
          e.from.state === "locked" && e.to.state === "locked";
        const alpha = bothLocked ? 0.07 : e.to.state === "mastered" ? 0.3 : 0.16;
        ctx!.strokeStyle = colorForState(
          e.to.state === "mastered"
            ? "mastered"
            : bothLocked
              ? "locked"
              : "unlocked",
          alpha,
        );
        ctx!.lineWidth = 1;
        ctx!.beginPath();
        ctx!.moveTo(e.from.x, e.from.y);
        ctx!.lineTo(e.to.x, e.to.y);
        ctx!.stroke();

        if (e.animating && !reduceMotion) {
          e.progress += dt / 900;
          const p = Math.min(e.progress, 1);
          const px = e.from.x + (e.to.x - e.from.x) * p;
          const py = e.from.y + (e.to.y - e.from.y) * p;
          ctx!.beginPath();
          ctx!.arc(px, py, 2.6, 0, Math.PI * 2);
          ctx!.fillStyle = "#F5D48A";
          ctx!.shadowColor = "#E8B34C";
          ctx!.shadowBlur = 10;
          ctx!.fill();
          ctx!.shadowBlur = 0;
          if (p >= 1) {
            e.animating = false;
            e.to.state = "unlocked";
            timers.push(
              setTimeout(() => {
                e.to.state = "mastered";
              }, 600),
            );
          }
        } else if (e.animating && reduceMotion) {
          e.animating = false;
          e.to.state = "mastered";
        }
      });

      nodes.forEach((n) => {
        if (n.state === "mastered") {
          ctx!.beginPath();
          ctx!.arc(n.x, n.y, n.r + 2, 0, Math.PI * 2);
          ctx!.fillStyle = "rgba(232,179,76,0.14)";
          ctx!.fill();
          ctx!.beginPath();
          ctx!.arc(n.x, n.y, n.r, 0, Math.PI * 2);
          ctx!.fillStyle = "#E8B34C";
          ctx!.shadowColor = "#E8B34C";
          ctx!.shadowBlur = 8;
          ctx!.fill();
          ctx!.shadowBlur = 0;
        } else if (n.state === "unlocked") {
          ctx!.beginPath();
          ctx!.arc(n.x, n.y, n.r, 0, Math.PI * 2);
          ctx!.strokeStyle = "#8FD9E8";
          ctx!.lineWidth = 1.4;
          ctx!.stroke();
        } else {
          ctx!.beginPath();
          ctx!.arc(n.x, n.y, n.r - 0.8, 0, Math.PI * 2);
          ctx!.fillStyle = "rgba(60,68,88,0.7)";
          ctx!.fill();
        }
      });

      ctx!.font = '11px "JetBrains Mono", monospace';
      ctx!.textAlign = "center";
      clusters.forEach((cl) => {
        ctx!.fillStyle = "rgba(136,145,165,0.55)";
        ctx!.fillText(cl.label, cl.cx, cl.cy - Math.min(W, H) * 0.16 - 14);
      });

      if (!reduceMotion) rafId = requestAnimationFrame(frame);
    }

    buildGraph();
    resize();
    window.addEventListener("resize", resize);

    let advanceTimer: ReturnType<typeof setInterval> | undefined;
    if (reduceMotion) {
      nodes.forEach((n, i) => {
        if (i % 3 === 0) n.state = "mastered";
        else if (i % 3 === 1) n.state = "unlocked";
      });
      frame(performance.now());
    } else {
      advanceTimer = setInterval(tryAdvance, 1500);
      rafId = requestAnimationFrame(frame);
    }

    return () => {
      window.removeEventListener("resize", resize);
      if (advanceTimer) clearInterval(advanceTimer);
      cancelAnimationFrame(rafId);
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
