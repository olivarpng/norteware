import { fragment, VERTEX } from "./smoke-shader.js";

const SPEED = 0.08;
const STILL_TIME = 6;
const FRAME_MS = 33;

export function initSmoke(canvas = document.querySelector(".smoke")) {
  if (!canvas) return;

  const gl = canvas.getContext("webgl", { alpha: false, antialias: false, powerPreference: "low-power" });
  const compact = window.matchMedia("(max-width: 800px)").matches;
  const program = gl && createProgram(gl, VERTEX, fragment(compact ? 4 : 5));

  if (!program) {
    document.documentElement.classList.add("no-smoke");
    return;
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const scale = compact ? 0.35 : 0.5;
  const uniforms = {
    resolution: gl.getUniformLocation(program, "uResolution"),
    time: gl.getUniformLocation(program, "uTime"),
    scroll: gl.getUniformLocation(program, "uScroll"),
  };

  gl.useProgram(program);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "aPosition");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const startedAt = performance.now();
  let frame = 0;
  let lastDraw = 0;

  function resize() {
    canvas.width = Math.max(1, Math.round(window.innerWidth * scale));
    canvas.height = Math.max(1, Math.round(window.innerHeight * scale));
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
    draw(currentTime());
  }

  const currentTime = () => (reduceMotion ? STILL_TIME : ((performance.now() - startedAt) / 1000) * SPEED + STILL_TIME);

  function draw(time) {
    gl.uniform1f(uniforms.time, time);
    gl.uniform1f(uniforms.scroll, reduceMotion ? 0 : window.scrollY);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function tick(now) {
    frame = requestAnimationFrame(tick);
    if (now - lastDraw < FRAME_MS) return;
    lastDraw = now;
    draw(currentTime());
  }

  const play = () => {
    if (!frame && !reduceMotion) frame = requestAnimationFrame(tick);
  };

  const pause = () => {
    cancelAnimationFrame(frame);
    frame = 0;
  };

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });
  document.addEventListener("visibilitychange", () => (document.hidden ? pause() : play()));
  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    pause();
    document.documentElement.classList.add("no-smoke");
  });

  resize();
  play();
}

function createProgram(gl, vertexSource, fragmentSource) {
  const compile = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
  };

  const vertex = compile(gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = compile(gl.FRAGMENT_SHADER, fragmentSource);
  if (!vertex || !fragmentShader) return null;

  const program = gl.createProgram();
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  return gl.getProgramParameter(program, gl.LINK_STATUS) ? program : null;
}
