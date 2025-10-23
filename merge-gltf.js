import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modelName = process.argv[2] || 'pawn';
const inputPath = path.join(__dirname, 'public', '3d-models', modelName, 'scene.gltf');
const outputPath = path.join(__dirname, 'public', '3d-models', modelName, 'merged.gltf');
const outputBinPath = path.join(__dirname, 'public', '3d-models', modelName, 'merged.bin');

console.log(`Reading ${modelName} model from ${inputPath}...`);

// Read the GLTF file
const gltfData = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
const binPath = path.join(path.dirname(inputPath), gltfData.buffers[0].uri);
const binData = fs.readFileSync(binPath);

console.log(`Found ${gltfData.meshes.length} meshes`);
console.log(`Mesh names:`, gltfData.meshes.map(m => m.name).join(', '));

// For simplicity, we'll create a new GLTF that references all primitives in a single mesh
// This allows you to load it without traversing multiple meshes

// Extract the root transformation matrix if it exists
let rootMatrix = null;
if (gltfData.nodes && gltfData.nodes[0] && gltfData.nodes[0].matrix) {
    rootMatrix = gltfData.nodes[0].matrix;
}

const newGltf = {
    asset: gltfData.asset,
    scene: 0,
    scenes: [
        {
            name: "MergedScene",
            nodes: [0]
        }
    ],
    nodes: [
        {
            mesh: 0,
            name: "MergedMesh"
        }
    ],
    meshes: [
        {
            name: `${modelName}_merged`,
            primitives: []
        }
    ],
    materials: gltfData.materials,
    accessors: gltfData.accessors,
    bufferViews: gltfData.bufferViews,
    buffers: [
        {
            byteLength: gltfData.buffers[0].byteLength,
            uri: "merged.bin"
        }
    ]
};

// Apply root transformation if it exists
if (rootMatrix) {
    newGltf.nodes[0].matrix = rootMatrix;
    console.log('Applied root transformation matrix');
}

// Collect all primitives from all meshes
gltfData.meshes.forEach(mesh => {
    mesh.primitives.forEach(primitive => {
        newGltf.meshes[0].primitives.push(primitive);
    });
});

console.log(`Merged into 1 mesh with ${newGltf.meshes[0].primitives.length} primitives`);

// Write the new GLTF file
fs.writeFileSync(outputPath, JSON.stringify(newGltf, null, 2));
console.log(`Saved merged GLTF to: ${outputPath}`);

// Copy the binary file
fs.copyFileSync(binPath, outputBinPath);
console.log(`Copied binary data to: ${outputBinPath}`);

console.log(`\nDone! You can now use this file in your code like this:`);
console.log(`\nimport modelSrc from '/3d-models/${modelName}/merged.gltf?url'`);
console.log(`\nloader.load(modelSrc, (gltf) => {`);
console.log(`    // The scene has 1 child which is the mesh node`);
console.log(`    const meshNode = gltf.scene.children[0];`);
console.log(`    console.log(meshNode); // This should be a Mesh, not a Group`);
console.log(`    // Or traverse once to get the mesh:`);
console.log(`    let mesh;`);
console.log(`    gltf.scene.traverse(el => {`);
console.log(`        if (el.isMesh) mesh = el;`);
console.log(`    });`);
console.log(`});`);
