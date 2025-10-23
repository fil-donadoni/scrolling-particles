import * as THREE from 'three'
import * as dat from 'lil-gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { addFrog } from './meshes/frog'
import { addKnight } from './meshes/knight'
import { createParticles, uniforms } from './utils/particles'
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Base
 */

// Debug
// const gui = new dat.GUI
// gui.add(uniforms.uProgress, 'value', 0, 1, .01)
gsap.registerPlugin(ScrollTrigger);

gsap.to(uniforms.uProgress, {
    value: 1,
    duration: 2,
    ease: 'linear',
    scrollTrigger: {
        trigger: "#app",
        start: 'top top',
        end: 'bottom bottom',
        scrub: 2
    }
})

// Canvas - Create and inject via JavaScript
const canvas = document.createElement('canvas')
canvas.className = 'webgl'
document.querySelector('#app').appendChild(canvas)

// Scene
const scene = new THREE.Scene()
// scene.background = new THREE.Color(0x001a33)

// Helpers - AxesHelper (rosso=X, verde=Y, blu=Z)
// const axesHelper = new THREE.AxesHelper(5)
// scene.add(axesHelper)

// Element
const loadingManager = new THREE.LoadingManager

const loader = new GLTFLoader(loadingManager)

const samplers = {};

addFrog(loader, samplers);
addKnight(loader, samplers);

loadingManager.onLoad = () => {
    console.log('all loaded!');

    createParticles(scene, samplers);
}

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(3, 3, 3)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Animate
const clock = new THREE.Clock()

const tick = () =>
{
    const time = clock.getElapsedTime()
    uniforms.uTime.value = time

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()