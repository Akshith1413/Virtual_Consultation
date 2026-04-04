// Heartbeat-style pulse glow shader
export const PulseShaderMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: null },
    uEmissiveColor: { value: null },
    uPulseSpeed: { value: 1.0 },
    uPulseIntensity: { value: 0.4 },
    uHovered: { value: 0.0 },
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;
    
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uColor;
    uniform vec3 uEmissiveColor;
    uniform float uPulseSpeed;
    uniform float uPulseIntensity;
    uniform float uHovered;
    
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;
    
    void main() {
      // Heartbeat pattern: quick double-beat then pause
      float t = mod(uTime * uPulseSpeed, 3.14159 * 2.0);
      float beat1 = pow(max(sin(t * 4.0), 0.0), 8.0);
      float beat2 = pow(max(sin(t * 4.0 - 0.8), 0.0), 8.0);
      float pulse = (beat1 + beat2 * 0.6) * uPulseIntensity;
      
      // Fresnel rim glow
      vec3 viewDir = normalize(cameraPosition - vPosition);
      float fresnel = 1.0 - max(dot(viewDir, vNormal), 0.0);
      fresnel = pow(fresnel, 2.5);
      
      // Combine
      vec3 baseColor = uColor;
      vec3 emissive = uEmissiveColor * (pulse + fresnel * 0.4 + uHovered * 0.3);
      
      // Simple lighting
      vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
      float diff = max(dot(vNormal, lightDir), 0.0) * 0.6 + 0.4;
      
      vec3 finalColor = baseColor * diff + emissive;
      gl_FragColor = vec4(finalColor, 0.95);
    }
  `
};

// Flowing particle/blood stream shader
export const FlowShaderMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uColor1: { value: null },
    uColor2: { value: null },
    uSpeed: { value: 1.0 },
    uOpacity: { value: 0.8 },
  },
  vertexShader: `
    attribute float aOffset;
    varying float vOffset;
    varying vec2 vUv;
    
    void main() {
      vOffset = aOffset;
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = 3.0;
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform float uSpeed;
    uniform float uOpacity;
    
    varying float vOffset;
    varying vec2 vUv;
    
    void main() {
      float flow = fract(vOffset + uTime * uSpeed);
      vec3 color = mix(uColor1, uColor2, flow);
      float alpha = sin(flow * 3.14159) * uOpacity;
      
      // Circular point shape
      vec2 center = gl_PointCoord - 0.5;
      float dist = length(center);
      if (dist > 0.5) discard;
      
      alpha *= smoothstep(0.5, 0.2, dist);
      gl_FragColor = vec4(color, alpha);
    }
  `
};

// Aurora/atmospheric background shader
export const AuroraShaderMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uColor1: { value: null },
    uColor2: { value: null },
    uColor3: { value: null },
    uIntensity: { value: 0.3 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;
    uniform float uIntensity;
    varying vec2 vUv;
    
    // Simplex-like noise
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }
    
    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }
    
    float fbm(vec2 p) {
      float value = 0.0;
      float amplitude = 0.5;
      for (int i = 0; i < 4; i++) {
        value += amplitude * noise(p);
        p *= 2.0;
        amplitude *= 0.5;
      }
      return value;
    }
    
    void main() {
      vec2 uv = vUv;
      
      float n1 = fbm(uv * 3.0 + uTime * 0.1);
      float n2 = fbm(uv * 2.0 - uTime * 0.15 + 10.0);
      float n3 = fbm(uv * 4.0 + uTime * 0.08 + 20.0);
      
      vec3 color = mix(uColor1, uColor2, n1);
      color = mix(color, uColor3, n2 * 0.5);
      
      float alpha = (n1 * 0.4 + n3 * 0.3) * uIntensity;
      alpha *= smoothstep(0.0, 0.3, uv.y) * smoothstep(1.0, 0.7, uv.y);
      
      gl_FragColor = vec4(color, alpha);
    }
  `
};
 
 
 
 
 
 
 
 
