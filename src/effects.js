// ============ CONFETTI + NUMBER LINE SVG ============
import { state, DIFFICULTY } from "./state.js";

// ============ CONFETTI ============

export function launchConfetti() {
  const canvas = document.createElement("canvas");
  canvas.id = "confetti-canvas";
  canvas.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999";
  document.body.appendChild(canvas);
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext("2d");

  const colors = ["#e84393", "#74b9ff", "#fd79a8", "#a29bfe", "#ffeaa7", "#55efc4", "#ff7675", "#f368e0", "#0abde3", "#feca57"];
  const pieces = [];
  const shapes = ["rect", "circle", "star"];

  const bursts = [
    { x: canvas.width * 0.5, y: canvas.height * 0.4 },
    { x: canvas.width * 0.3, y: canvas.height * 0.3 },
    { x: canvas.width * 0.7, y: canvas.height * 0.3 },
    { x: canvas.width * 0.2, y: canvas.height * 0.5 },
    { x: canvas.width * 0.8, y: canvas.height * 0.5 },
  ];

  bursts.forEach((burst) => {
    for (let i = 0; i < 80; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 12 + 4;
      pieces.push({
        x: burst.x, y: burst.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        size: Math.random() * 10 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        rotation: Math.random() * 360,
        rotSpeed: Math.random() * 10 - 5,
        gravity: 0.15, opacity: 1,
        fade: Math.random() * 0.005 + 0.002,
      });
    }
  });

  let frame = 0;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;

    pieces.forEach((p) => {
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.99;
      p.rotation += p.rotSpeed;
      p.opacity -= p.fade;
      if (p.opacity <= 0) return;
      alive = true;

      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;

      if (p.shape === "circle") {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === "star") {
        drawStar(ctx, 0, 0, 5, p.size / 2, p.size / 4);
      } else {
        ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.6);
      }
      ctx.restore();
    });

    frame++;
    if (alive && frame < 400) {
      requestAnimationFrame(animate);
    } else {
      canvas.remove();
    }
  }

  function drawStar(ctx, cx, cy, spikes, outerR, innerR) {
    let rot = (Math.PI / 2) * 3;
    const step = Math.PI / spikes;
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerR);
    for (let i = 0; i < spikes; i++) {
      ctx.lineTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR);
      rot += step;
      ctx.lineTo(cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerR);
    ctx.closePath();
    ctx.fill();
  }

  animate();
}

// ============ NUMBER LINE VISUALIZATION ============

function createNumberLineSVG(a, op, b, answer, maxNum) {
  const svgNS = "http://www.w3.org/2000/svg";
  const width = 380;
  const height = 65;
  const padding = 25;
  const lineY = 40;
  const lineWidth = width - 2 * padding;

  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "auto");

  // Number line
  const line = document.createElementNS(svgNS, "line");
  line.setAttribute("x1", padding);
  line.setAttribute("y1", lineY);
  line.setAttribute("x2", width - padding);
  line.setAttribute("y2", lineY);
  line.setAttribute("stroke", "#ccc");
  line.setAttribute("stroke-width", "2");
  svg.appendChild(line);

  // Ticks and numbers
  for (let n = 0; n <= maxNum; n++) {
    const x = padding + (n / maxNum) * lineWidth;

    const tick = document.createElementNS(svgNS, "line");
    tick.setAttribute("x1", x);
    tick.setAttribute("y1", lineY - 5);
    tick.setAttribute("x2", x);
    tick.setAttribute("y2", lineY + 5);
    tick.setAttribute("stroke", "#999");
    tick.setAttribute("stroke-width", "1.5");
    svg.appendChild(tick);

    const text = document.createElementNS(svgNS, "text");
    text.setAttribute("x", x);
    text.setAttribute("y", lineY + 18);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("font-size", "10");
    text.setAttribute("fill", "#666");
    text.textContent = n;
    svg.appendChild(text);
  }

  const startX = padding + (a / maxNum) * lineWidth;
  const endX = padding + (answer / maxNum) * lineWidth;

  // Start dot
  const startDot = document.createElementNS(svgNS, "circle");
  startDot.setAttribute("cx", startX);
  startDot.setAttribute("cy", lineY);
  startDot.setAttribute("r", "5");
  startDot.setAttribute("fill", "#e84393");
  svg.appendChild(startDot);

  // End dot
  const endDot = document.createElementNS(svgNS, "circle");
  endDot.setAttribute("cx", endX);
  endDot.setAttribute("cy", lineY);
  endDot.setAttribute("r", "5");
  endDot.setAttribute("fill", "#4caf50");
  svg.appendChild(endDot);

  // Arc showing the jump
  const midX = (startX + endX) / 2;
  const arcHeight = Math.min(25, Math.abs(endX - startX) * 0.4);
  const arcY = lineY - arcHeight - 5;

  const path = document.createElementNS(svgNS, "path");
  const d = `M ${startX},${lineY - 6} Q ${midX},${arcY} ${endX},${lineY - 6}`;
  path.setAttribute("d", d);
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", "#42a5f5");
  path.setAttribute("stroke-width", "2");
  path.setAttribute("stroke-dasharray", "4,3");
  svg.appendChild(path);

  // Arrow at end
  const arrowSize = 4;
  const arrowDir = endX > startX ? -1 : 1;
  const arrow = document.createElementNS(svgNS, "polygon");
  arrow.setAttribute("points", `${endX},${lineY - 6} ${endX + arrowDir * arrowSize},${lineY - 6 - arrowSize} ${endX + arrowDir * arrowSize},${lineY - 6 + arrowSize}`);
  arrow.setAttribute("fill", "#42a5f5");
  svg.appendChild(arrow);

  // Label on the arc
  const label = document.createElementNS(svgNS, "text");
  label.setAttribute("x", midX);
  label.setAttribute("y", arcY - 2);
  label.setAttribute("text-anchor", "middle");
  label.setAttribute("font-size", "11");
  label.setAttribute("font-weight", "bold");
  label.setAttribute("fill", "#1565c0");
  label.textContent = `${op}${b}`;
  svg.appendChild(label);

  return svg;
}

export function showNumberLineHelp(exerciseIndex) {
  const ex = state.exercises[exerciseIndex];
  if (!ex || ex.type === "zehner") return;

  const div = document.querySelector(`.exercise[data-index="${exerciseIndex}"]`);
  if (!div || div.querySelector(".numberline-help")) return;

  let a, op, b, answer, maxNum;
  const config = DIFFICULTY[state.currentDifficulty];

  if (ex.type === "normal") {
    a = ex.a;
    op = ex.op;
    b = ex.b;
    answer = ex.answer;
    maxNum = config.maxResult;
  } else if (ex.type === "luecke") {
    const d = ex.display;
    if (d.left === null) {
      if (d.op === "+") {
        a = ex.answer;
        op = "+";
        b = d.right;
        answer = d.result;
      } else {
        a = ex.answer;
        op = "-";
        b = d.right;
        answer = d.result;
      }
    } else {
      a = d.left;
      op = d.op;
      b = ex.answer;
      answer = d.result;
      if (d.op === "-") {
        answer = d.result;
      }
    }
    maxNum = config.maxResult;
  }

  if (a === undefined) return;

  const helpDiv = document.createElement("div");
  helpDiv.className = "numberline-help";

  const svg = createNumberLineSVG(a, op, b, answer, maxNum);
  helpDiv.appendChild(svg);

  const labelDiv = document.createElement("div");
  labelDiv.className = "numberline-label";
  labelDiv.textContent = `${a} ${op} ${b} = ${answer}`;
  helpDiv.appendChild(labelDiv);

  div.appendChild(helpDiv);
}
