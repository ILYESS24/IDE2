import { useEffect, useRef } from "react";

const LavaLampBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    if (!gl) {
      console.warn("WebGL not supported");
      return;
    }

    let animationId: number;
    const startTime = Date.now();

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    resize();
    window.addEventListener("resize", resize);

    // Vertex shader
    const vertexShaderSource = `
      attribute vec2 position;
      varying vec2 vUv;
      void main() {
        vUv = position * 0.5 + 0.5;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    // Fragment shader - Lava lamp metaballs
    const fragmentShaderSource = `
      precision highp float;
      varying vec2 vUv;
      uniform float time;
      uniform vec2 resolution;

      float PI = 3.141592653589793238;

      mat4 rotationMatrix(vec3 axis, float angle) {
          axis = normalize(axis);
          float s = sin(angle);
          float c = cos(angle);
          float oc = 1.0 - c;
          return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                      oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                      oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                      0.0,                                0.0,                                0.0,                                1.0);
      }

      vec3 rotate(vec3 v, vec3 axis, float angle) {
          mat4 m = rotationMatrix(axis, angle);
          return (m * vec4(v, 1.0)).xyz;
      }

      float smin(float a, float b, float k) {
          k *= 6.0;
          float h = max(k - abs(a - b), 0.0) / k;
          return min(a, b) - h * h * h * k * (1.0 / 6.0);
      }

      float sphereSDF(vec3 p, float r) {
          return length(p) - r;
      }

      float sdf(vec3 p) {
          vec3 p1 = rotate(p, vec3(0.0, 0.0, 1.0), time / 5.0);
          vec3 p2 = rotate(p, vec3(1.0), -time / 5.0);
          vec3 p3 = rotate(p, vec3(1.0, 1.0, 0.0), -time / 4.5);
          vec3 p4 = rotate(p, vec3(0.0, 1.0, 0.0), -time / 4.0);

          float final_dist = sphereSDF(p1 - vec3(-0.5, 0.0, 0.0), 0.35);
          float nextSphere = sphereSDF(p2 - vec3(0.55, 0.0, 0.0), 0.3);
          final_dist = smin(final_dist, nextSphere, 0.1);
          nextSphere = sphereSDF(p2 - vec3(-0.8, 0.0, 0.0), 0.2);
          final_dist = smin(final_dist, nextSphere, 0.1);
          nextSphere = sphereSDF(p3 - vec3(1.0, 0.0, 0.0), 0.15);
          final_dist = smin(final_dist, nextSphere, 0.1);
          nextSphere = sphereSDF(p4 - vec3(0.45, -0.45, 0.0), 0.15);
          final_dist = smin(final_dist, nextSphere, 0.1);

          return final_dist;
      }

      vec3 getNormal(vec3 p) {
          float d = 0.001;
          return normalize(vec3(
              sdf(p + vec3(d, 0.0, 0.0)) - sdf(p - vec3(d, 0.0, 0.0)),
              sdf(p + vec3(0.0, d, 0.0)) - sdf(p - vec3(0.0, d, 0.0)),
              sdf(p + vec3(0.0, 0.0, d)) - sdf(p - vec3(0.0, 0.0, d))
          ));
      }

      float rayMarch(vec3 rayOrigin, vec3 ray) {
          float t = 0.0;
          for (int i = 0; i < 100; i++) {
              vec3 p = rayOrigin + ray * t;
              float d = sdf(p);
              if (d < 0.001) return t;
              t += d;
              if (t > 100.0) break;
          }
          return -1.0;
      }

      void main() {
          float a1, a2;
          if (resolution.y / resolution.x > 1.0) {
              a1 = (resolution.x / resolution.y);
              a2 = 1.0;
          } else {
              a1 = 1.0;
              a2 = (resolution.y / resolution.x);
          }

          vec3 cameraPos = vec3(0.0, 0.0, 5.0);
          vec3 ray = normalize(vec3((vUv - vec2(0.5)) * vec2(a1, a2), -1.0));
          vec3 color = vec3(0.0);

          float t = rayMarch(cameraPos, ray);
          if (t > 0.0) {
              vec3 p = cameraPos + ray * t;
              vec3 normal = getNormal(p);
              float fresnel = pow(1.0 + dot(ray, normal), 3.0);
              color = vec3(fresnel);
              gl_FragColor = vec4(color, 1.0);
          } else {
              gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
          }
      }
    `;

    // Create shader
    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

    if (!vertexShader || !fragmentShader) return;

    // Create program
    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Create fullscreen quad
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    const positionLocation = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Get uniform locations
    const timeLocation = gl.getUniformLocation(program, "time");
    const resolutionLocation = gl.getUniformLocation(program, "resolution");

    const animate = () => {
      const time = (Date.now() - startTime) / 1000;

      gl.uniform1f(timeLocation, time);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};

export default LavaLampBackground;