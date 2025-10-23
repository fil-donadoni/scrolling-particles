import vertex from '../shaders/vertex.glsl'
import fragment from '../shaders/fragment.glsl'
import { Color, BufferAttribute, BufferGeometry, ShaderMaterial, Vector3, AdditiveBlending, Points } from 'three'

const colors = [
    new Color('#379392'),
    new Color('#17301C'),
    new Color('#4FB0C6'),
]

export const uniforms = {
    uTime: { value: 0 },
    uProgress: { value: 0 },
};

export const createParticles = (scene, samplers) => {
    const geometry = new BufferGeometry();
    const particlesCount = 5000;

    const positionArray = new Float32Array(particlesCount * 3);
    const position2Array = new Float32Array(particlesCount * 3);
    const colorArray = new Float32Array(particlesCount * 3);
    const offsetArray = new Float32Array(particlesCount * 3);

    const pos = new Vector3();

    for (let i = 0; i < particlesCount; i++) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const [r, g, b] = color;
        colorArray.set([r, g, b], i * 3);

        const offset = Math.random();
        offsetArray[i] = offset

        samplers.frog.sample(pos);
        const [x, y, z] = pos;
        positionArray.set([x, y, z], i * 3);

        samplers.knight.sample(pos);
        const [x2, y2, z2] = pos;
        position2Array.set([x2, y2, z2], i * 3);
    }

    geometry.setAttribute('position', new BufferAttribute(positionArray, 3));
    geometry.setAttribute('position2', new BufferAttribute(position2Array, 3));
    geometry.setAttribute('color', new BufferAttribute(colorArray, 3));
    geometry.setAttribute('offset', new BufferAttribute(offsetArray, 1));

    const material = new ShaderMaterial({
        uniforms: {
            ...uniforms,
        },
        fragmentShader: fragment,
        vertexShader: vertex,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending
    })

    const particles = new Points(geometry, material);
    scene.add(particles);
}
