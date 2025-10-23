import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import frogSrc from '/3d-models/frog/frog.glb?url'
import {
    MeshNormalMaterial,
    DoubleSide,
    Mesh
} from "three";

export const addFrog = async (loader, samplers) => {
    loader.load(
        frogSrc,
        (gltf) => {
            const meshes = [];
            gltf.scene.traverse(el => {
                if (el.isMesh) {
                    meshes.push(el);
                }
            });

            const geometries = [];
            meshes.forEach(mesh => {
                const clonedGeometry = mesh.geometry.clone();
                clonedGeometry.applyMatrix4(mesh.matrixWorld);
                geometries.push(clonedGeometry);
            });

            const mergedGeometry = mergeGeometries(geometries);

            // Center the geometry
            mergedGeometry.center();

            mergedGeometry.rotateX(-90);
            mergedGeometry.rotateY(45);

            mergedGeometry.scale(0.5, 0.5, 0.5);

            // Create a new mesh with the merged geometry
            const material = new MeshNormalMaterial({
                side: DoubleSide,
                flatShading: false
            });

            const model = new Mesh(mergedGeometry, material);

            // scene.add(model);

            const sampler = new MeshSurfaceSampler(model).build();
            samplers.frog = sampler
        },
        undefined,
        (error) => {
            console.error('Error loading frog model:', error);
            reject(error);
        }
    );
}