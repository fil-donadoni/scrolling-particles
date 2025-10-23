import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import kingSrc from '/3d-models/king/merged.gltf?url'
import {
    MeshNormalMaterial,
    DoubleSide,
    Mesh
} from "three";

export const addKing = (loader, samplers) => {
    loader.load(
        kingSrc,
        (gltf) =>
        {
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
            mergedGeometry.computeBoundingBox();
            mergedGeometry.center();

            mergedGeometry.scale(0.04, 0.04, 0.04);

            // Create a new mesh with the merged geometry
            const material = new MeshNormalMaterial({
                side: DoubleSide,
                flatShading: false
            });

            const model = new Mesh(mergedGeometry, material);

            // scene.add(model);

            const sampler = new MeshSurfaceSampler(model).build();
            samplers.king = sampler;
        }
    );
}