// ===== 3D PMMA Structure using Three.js =====

// Load Three.js from CDN
const script = document.createElement('script');
script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
script.onload = function() {
    initiate3DStructure();
};
document.head.appendChild(script);

let scene, camera, renderer, molecule, autoRotateEnabled = true;

function initiate3DStructure() {
    const container = document.getElementById('canvas-3d');
    
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);

    // Camera setup
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 15;

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    // Create PMMA Polymer Chain
    molecule = new THREE.Group();
    createPMMAChain();
    scene.add(molecule);

    // Mouse controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    container.addEventListener('mousedown', (e) => {
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    container.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const deltaX = e.clientX - previousMousePosition.x;
            const deltaY = e.clientY - previousMousePosition.y;

            molecule.rotation.y += deltaX * 0.005;
            molecule.rotation.x += deltaY * 0.005;

            previousMousePosition = { x: e.clientX, y: e.clientY };
        }
    });

    container.addEventListener('mouseup', () => {
        isDragging = false;
    });

    container.addEventListener('mouseleave', () => {
        isDragging = false;
    });

    // Zoom with scroll
    container.addEventListener('wheel', (e) => {
        e.preventDefault();
        camera.position.z += e.deltaY * 0.01;
        camera.position.z = Math.max(5, Math.min(50, camera.position.z));
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
    });

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);

        if (autoRotateEnabled) {
            molecule.rotation.y += 0.003;
            molecule.rotation.x += 0.001;
        }

        renderer.render(scene, camera);
    }

    animate();
}

function createPMMAChain() {
    // Create 8 repeating units of PMMA
    const unitCount = 8;
    const spacing = 3;

    for (let i = 0; i < unitCount; i++) {
        createMonomerUnit(i * spacing, 0, 0);
    }

    // Connect units with bonds
    for (let i = 0; i < unitCount - 1; i++) {
        const pos1 = new THREE.Vector3(i * spacing + 1.2, 0, 0);
        const pos2 = new THREE.Vector3((i + 1) * spacing, 0, 0);
        createBond(pos1, pos2, 0x666666, 0.15);
    }
}

function createMonomerUnit(x, y, z) {
    // Carbon backbone (black)
    const carbonColor = 0x333333;
    createAtom(x, y, z, 0.5, carbonColor);
    createAtom(x + 1.2, y, z, 0.5, carbonColor);

    // Create bond between carbons
    createBond(new THREE.Vector3(x, y, z), new THREE.Vector3(x + 1.2, y, z), carbonColor, 0.2);

    // Oxygen (red) - ester group
    const oxygenColor = 0xff0000;
    createAtom(x + 1.2, y + 1.2, z, 0.4, oxygenColor);
    createBond(new THREE.Vector3(x + 1.2, y, z), new THREE.Vector3(x + 1.2, y + 1.2, z), 0x666666, 0.15);

    // Methyl group (green) - substituent
    const methylColor = 0x2ecc71;
    createAtom(x + 0.6, y + 1, z, 0.35, methylColor);
    createBond(new THREE.Vector3(x, y, z), new THREE.Vector3(x + 0.6, y + 1, z), 0x666666, 0.15);

    // Hydrogen atoms (light blue) - represented as small spheres
    const hydrogenColor = 0x00d4ff;
    
    // Hydrogens on first carbon
    createAtom(x - 0.4, y + 0.6, z + 0.5, 0.25, hydrogenColor);
    createAtom(x - 0.4, y - 0.6, z - 0.5, 0.25, hydrogenColor);

    // Hydrogens on second carbon
    createAtom(x + 1.6, y + 0.5, z - 0.6, 0.25, hydrogenColor);
    createAtom(x + 1.6, y - 0.5, z + 0.6, 0.25, hydrogenColor);

    // Add labels (using canvas texture for text)
    addLabel(x, y, z, 'C');
    addLabel(x + 1.2, y, z, 'C');
}

function createAtom(x, y, z, size, color) {
    const geometry = new THREE.SphereGeometry(size, 32, 32);
    const material = new THREE.MeshPhongMaterial({ 
        color: color,
        shininess: 100,
        emissive: color,
        emissiveIntensity: 0.2
    });
    const atom = new THREE.Mesh(geometry, material);
    atom.position.set(x, y, z);
    molecule.add(atom);
}

function createBond(pos1, pos2, color, thickness) {
    const geometry = new THREE.CylinderGeometry(thickness, thickness, pos1.distanceTo(pos2), 16);
    const material = new THREE.MeshPhongMaterial({ color: color });
    const bond = new THREE.Mesh(geometry, material);

    const midpoint = new THREE.Vector3().addVectors(pos1, pos2).multiplyScalar(0.5);
    bond.position.copy(midpoint);

    const direction = new THREE.Vector3().subVectors(pos2, pos1).normalize();
    bond.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);

    molecule.add(bond);
}

function addLabel(x, y, z, text) {
    // Create canvas texture for text
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');

    context.fillStyle = '#333333';
    context.font = 'Bold 120px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, 128, 128);

    const texture = new THREE.CanvasTexture(canvas);
    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    const label = new THREE.Mesh(geometry, material);
    label.position.set(x, y - 1.5, z);
    label.lookAt(camera.position);

    molecule.add(label);
}

function toggleRotation() {
    autoRotateEnabled = !autoRotateEnabled;
    const btn = document.querySelector('.toggle-rotation-btn');
    if (autoRotateEnabled) {
        btn.textContent = 'Toggle Auto-Rotate';
    } else {
        btn.textContent = 'Start Auto-Rotate';
    }
}