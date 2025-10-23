attribute vec3 color;
attribute float offset;
attribute vec3 position2;
varying vec3 vColor;
varying float vDistance;
uniform float uTime;
uniform float uProgress;

void main() {
    vColor = color;

    vec3 pos = mix(position, position2, uProgress);
    pos *= 1. + sin(3.14 * uProgress) * 2.5;
    pos.x += cos(uTime * 0.5 * (offset - 0.5) + offset * 10.) * 0.05;
    pos.y += sin(uTime * 0.5 * (offset - 0.5) + offset * 10.) * 0.05;

    vec3 wPos = vec4(modelMatrix * vec4(pos, 1.0)).xyz;
    float dist = distance(wPos, cameraPosition);

    vDistance = smoothstep(100., 0., dist);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = 20. * vDistance * (sin(uTime * 2.0 + offset * 10.) * 0.4 + 0.6);
}