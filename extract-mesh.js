import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modelName = process.argv[2] || 'pawn';
const inputPath = path.join(__dirname, 'public', '3d-models', modelName, 'scene.gltf');
const outputPath = path.join(__dirname, 'public', '3d-models', modelName, 'merged.gltf');

console.log(`Loading ${modelName} model...`);

// Convert file path to file:// URL
const inputURL = pathToFileURL(inputPath).href;

const loader = new GLTFLoader();
loader.load(
    inputURL,
    (gltf) => {
        console.log('Model loaded successfully');

        const meshes = [];
        gltf.scene.traverse((el) => {
            if (el.isMesh) {
                meshes.push(el);
            }
        });

        console.log(`Total meshes found: ${meshes.length}`);

        if (meshes.length === 0) {
            console.error('No meshes found in the model!');
            process.exit(1);
        }

        // Merge all geometries
        const geometries = [];
        meshes.forEach((mesh) => {
            const clonedGeometry = mesh.geometry.clone();
            clonedGeometry.applyMatrix4(mesh.matrixWorld);
            geometries.push(clonedGeometry);
        });

        const mergedGeometry = mergeGeometries(geometries);

        // Center the geometry
        mergedGeometry.computeBoundingBox();
        const center = new THREE.Vector3();
        mergedGeometry.boundingBox.getCenter(center);
        mergedGeometry.translate(-center.x, -center.y, -center.z);

        console.log(`Geometry centered. Original center was at:`, center);

        // Create a new mesh with the merged and centered geometry
        const material = new THREE.MeshStandardMaterial({ color: 0xcccccc });
        const mergedMesh = new THREE.Mesh(mergedGeometry, material);
        mergedMesh.name = `${modelName}_merged`;

        // Create a new scene with just the merged mesh
        const exportScene = new THREE.Scene();
        exportScene.add(mergedMesh);

        // Export to GLTF
        const exporter = new GLTFExporter();
        exporter.parse(
            exportScene,
            (result) => {
                const output = JSON.stringify(result, null, 2);
                fs.writeFileSync(outputPath, output);
                console.log(`Merged and centered mesh saved to: ${outputPath}`);
                console.log(`You can now load this file directly without traverse!`);
            },
            (error) => {
                console.error('Error exporting GLTF:', error);
                process.exit(1);
            },
            { binary: false }
        );
    },
    undefined,
    (error) => {
        console.error('Error loading model:', error);
        process.exit(1);
    }
);
