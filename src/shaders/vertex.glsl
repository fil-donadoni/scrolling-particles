attribute vec3 color;
attribute float offset;
attribute vec3 position2;
attribute vec3 position3;
varying vec3 vColor;
varying float vDistance;
uniform float uTime;
uniform float uProgress;

void main() {
    vColor = color;

    // Mix tra 3 posizioni: 0-1 = position->position2, 1-2 = position2->position3
    vec3 pos;
    float progress = clamp(uProgress, 0., 2.);
    float transitionProgress; // 0 sui mesh, 1 a metà transizione

    if (progress <= 1.) {
        // Prima metà: morph da position a position2
        pos = mix(position, position2, progress);
        transitionProgress = progress;
    } else {
        // Seconda metà: morph da position2 a position3
        pos = mix(position2, position3, progress - 1.);
        transitionProgress = progress - 1.;
    }

    // Esplosione solo durante le transizioni (sin va da 0 a 1 a 0)
    float explosion = sin(3.14 * transitionProgress);
    pos *= 1. + explosion * 2.5;
    pos.x += cos(uTime * 0.5 * (offset - 0.5) + offset * 10.) * 0.05;
    pos.y += sin(uTime * 0.5 * (offset - 0.5) + offset * 10.) * 0.05;

    vec3 wPos = vec4(modelMatrix * vec4(pos, 1.0)).xyz;
    float dist = distance(wPos, cameraPosition);

    vDistance = smoothstep(100., 0., dist);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = 20. * vDistance * (sin(uTime * 2.0 + offset * 10.) * 0.4 + 0.6);
}