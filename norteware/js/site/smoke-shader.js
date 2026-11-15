export const VERTEX = `
attribute vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

export const fragment = (octaves) => `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

#define OCTAVES ${octaves}

uniform vec2 uResolution;
uniform float uTime;
uniform float uScroll;

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

const mat2 TURN = mat2(1.6, 1.2, -1.2, 1.6);

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < OCTAVES; i++) {
    value += amplitude * noise(p);
    p = p * TURN;
    amplitude *= 0.5;
  }
  return value;
}

float ridge(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < OCTAVES; i++) {
    value += amplitude * (1.0 - abs(2.0 * noise(p) - 1.0));
    p = p * TURN;
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 p = (gl_FragCoord.xy - 0.5 * uResolution) / min(uResolution.x, uResolution.y) * 2.2;
  p.y += uScroll * 0.0003;

  float t = uTime;
  vec2 q = vec2(fbm(p + vec2(0.0, t * 0.6)), fbm(p + vec2(5.2, 1.3 - t * 0.5)));
  vec2 r = vec2(
    fbm(p + 3.0 * q + vec2(1.7 + t * 0.35, 9.2)),
    fbm(p + 3.0 * q + vec2(8.3 - t * 0.3, 2.8))
  );
  float f = ridge(p + 2.5 * r);

  float smoke = pow(smoothstep(0.42, 0.95, f), 1.8);

  vec2 c = vec2((uv.x - 0.5) * uResolution.x / uResolution.y, uv.y - 0.5);
  float edge = smoothstep(0.2, 0.95, length(c));
  float s = smoke * mix(0.22, 1.0, edge) * 0.9;

  vec3 dark = vec3(0.10, 0.02, 0.22);
  vec3 mid = vec3(0.30, 0.10, 0.58);
  vec3 light = vec3(0.55, 0.32, 0.92);

  vec3 color = mix(dark, mid, s);
  color = mix(color, light, pow(s, 3.0) * 0.5);
  color *= clamp(s * 1.6, 0.0, 1.0);
  color += vec3(0.012, 0.0, 0.03) * (0.4 + edge);

  gl_FragColor = vec4(color, 1.0);
}`;
