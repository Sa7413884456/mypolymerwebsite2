// Global Objects for 3D Visualization
const scenes = {};
const cameras = {};
const renderers = {};
const molecules = {};
const autoRotate = {};

// Load Three.js library
const script = document.createElement('script');
script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
script.onload = function() {
    console.log('Three.js loaded successfully');
    initializeAllCanvases();
};
document.head.appendChild(script);

// Initialize all three canvases
function initializeAllCanvases() {
    setTimeout(() => {
        if (typeof THREE !== 'undefined') {
            initializeCanvas('isotactic');
            initializeCanvas('atactic');
            initializeCanvas('syndiotactic');
        }
    }, 100);
}

function initializeCanvas(type) {
    const container = document.getElementById(`canvas-${type}`);
    if (!container) {
        console.warn(`Canvas container for ${type} not found`);
        return;
    }

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    scenes[type] = new THREE.Scene();
    scenes[type].background = new THREE.Color(0xf5f5f5);
    scenes[type].fog = new THREE.Fog(0xf5f5f5, 100, 500);

    // Camera
    cameras[type] = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    cameras[type].position.z = 20;

    // Renderer
    renderers[type] = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderers[type].setSize(width, height);
    renderers[type].setPixelRatio(window.devicePixelRatio);
    renderers[type].shadowMap.enabled = true;
    container.appendChild(renderers[type].domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scenes[type].add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 15, 10);
    directionalLight.castShadow = true;
    scenes[type].add(directionalLight);

    const pointLight = new THREE.PointLight(0x00d4ff, 0.5);
    pointLight.position.set(-15, -10, 15);
    scenes[type].add(pointLight);

    // Create polymer group
    molecules[type] = new THREE.Group();
    
    // Create appropriate structure
    if (type === 'isotactic') {
        createIsotacticPMMA(molecules[type]);
    } else if (type === 'atactic') {
        createAtacticPMMA(molecules[type]);
    } else if (type === 'syndiotactic') {
        createSyndiotacticPMMA(molecules[type]);
    }

    scenes[type].add(molecules[type]);

    // Setup controls
    setupMouseControls(container, type);
    setupZoomControls(container, type);

    // Initialize auto-rotation
    autoRotate[type] = true;

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);

        if (autoRotate[type]) {
            molecules[type].rotation.y += 0.003;
            molecules[type].rotation.x += 0.0008;
        }

        renderers[type].render(scenes[type], cameras[type]);
    }

    animate();
}

// Mouse Controls
function setupMouseControls(container, type) {
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    container.addEventListener('mousedown', (e) => {
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
        autoRotate[type] = false;
    });

    container.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const deltaX = e.clientX - previousMousePosition.x;
            const deltaY = e.clientY - previousMousePosition.y;

            molecules[type].rotation.y += deltaX * 0.005;
            molecules[type].rotation.x += deltaY * 0.005;

            previousMousePosition = { x: e.clientX, y: e.clientY };
        }
    });

    container.addEventListener('mouseup', () => {
        isDragging = false;
    });

    container.addEventListener('mouseleave', () => {
        isDragging = false;
    });
}

// Zoom Controls
function setupZoomControls(container, type) {
    container.addEventListener('wheel', (e) => {
        e.preventDefault();
        cameras[type].position.z += e.deltaY * 0.01;
        cameras[type].position.z = Math.max(10, Math.min(50, cameras[type].position.z));
    });
}

// ===== CREATE STRUCTURES =====

// Create Isotactic PMMA
function createIsotacticPMMA(group) {
    const unitCount = 6;
    const spacing = 3;

    for (let i = 0; i < unitCount; i++) {
        const x = i * spacing - (unitCount * spacing) / 2;
        const y = 0;
        const z = 0;

        // Carbon backbone atoms
        createAtom(group, x, y, z, 0.5, 0x333333, 'Carbon');
        createAtom(group, x + 1.2, y, z, 0.5, 0x333333, 'Carbon');

        // Bond between carbons
        createBond(group, new THREE.Vector3(x, y, z), new THREE.Vector3(x + 1.2, y, z), 0x666666, 0.2);

        // Ester group (ALWAYS ON TOP - isotactic)
        const esterY = 1.5;
        createAtom(group, x + 0.6, y + esterY, z, 0.4, 0xff0000, 'Oxygen');
        createBond(group, new THREE.Vector3(x + 0.6, y, z), new THREE.Vector3(x + 0.6, y + esterY, z), 0x888888, 0.15);

        // Methyl group (ALWAYS ON TOP - isotactic)
        const methylY = 1.2;
        createAtom(group, x + 0.2, y + methylY, z + 0.8, 0.35, 0x2ecc71, 'Methyl');
        createBond(group, new THREE.Vector3(x, y, z), new THREE.Vector3(x + 0.2, y + methylY, z + 0.8), 0x888888, 0.15);

        // Hydrogen atoms
        createAtom(group, x - 0.3, y, z + 0.6, 0.25, 0x00d4ff, 'H');
        createAtom(group, x + 1.5, y, z - 0.6, 0.25, 0x00d4ff, 'H');
    }
}

// Create Atactic PMMA
function createAtacticPMMA(group) {
    const unitCount = 6;
    const spacing = 3;

    for (let i = 0; i < unitCount; i++) {
        const x = i * spacing - (unitCount * spacing) / 2;
        const y = 0;
        const z = 0;

        // Carbon backbone
        createAtom(group, x, y, z, 0.5, 0x333333, 'Carbon');
        createAtom(group, x + 1.2, y, z, 0.5, 0x333333, 'Carbon');

        createBond(group, new THREE.Vector3(x, y, z), new THREE.Vector3(x + 1.2, y, z), 0x666666, 0.2);

        // RANDOM placement (atactic)
        const randomSide = Math.random() > 0.5 ? 1 : -1;
        const esterY = 1.5 * randomSide;
        const methylY = 1.2 * randomSide;
        const methylZ = 0.8 * randomSide;

        // Ester group (random side)
        createAtom(group, x + 0.6, y + esterY, z, 0.4, 0xff0000, 'Oxygen');
        createBond(group, new THREE.Vector3(x + 0.6, y, z), new THREE.Vector3(x + 0.6, y + esterY, z), 0x888888, 0.15);

        // Methyl group (random side)
        createAtom(group, x + 0.2, y + methylY, z + methylZ, 0.35, 0x2ecc71, 'Methyl');
        createBond(group, new THREE.Vector3(x, y, z), new THREE.Vector3(x + 0.2, y + methylY, z + methylZ), 0x888888, 0.15);

        // Hydrogen atoms
        createAtom(group, x - 0.3, y, z + 0.6, 0.25, 0x00d4ff, 'H');
        createAtom(group, x + 1.5, y, z - 0.6, 0.25, 0x00d4ff, 'H');
    }
}

// Create Syndiotactic PMMA
function createSyndiotacticPMMA(group) {
    const unitCount = 6;
    const spacing = 3;

    for (let i = 0; i < unitCount; i++) {
        const x = i * spacing - (unitCount * spacing) / 2;
        const y = 0;
        const z = 0;

        // Carbon backbone
        createAtom(group, x, y, z, 0.5, 0x333333, 'Carbon');
        createAtom(group, x + 1.2, y, z, 0.5, 0x333333, 'Carbon');

        createBond(group, new THREE.Vector3(x, y, z), new THREE.Vector3(x + 1.2, y, z), 0x666666, 0.2);

        // ALTERNATING placement (syndiotactic)
        const alternating = (i % 2 === 0) ? 1 : -1;
        const esterY = 1.5 * alternating;
        const methylY = 1.2 * alternating;
        const methylZ = 0.8 * alternating;

        // Ester group (alternating)
        createAtom(group, x + 0.6, y + esterY, z, 0.4, 0xff0000, 'Oxygen');
        createBond(group, new THREE.Vector3(x + 0.6, y, z), new THREE.Vector3(x + 0.6, y + esterY, z), 0x888888, 0.15);

        // Methyl group (alternating)
        createAtom(group, x + 0.2, y + methylY, z + methylZ, 0.35, 0x2ecc71, 'Methyl');
        createBond(group, new THREE.Vector3(x, y, z), new THREE.Vector3(x + 0.2, y + methylY, z + methylZ), 0x888888, 0.15);

        // Hydrogen atoms
        createAtom(group, x - 0.3, y, z + 0.6, 0.25, 0x00d4ff, 'H');
        createAtom(group, x + 1.5, y, z - 0.6, 0.25, 0x00d4ff, 'H');
    }
}

// Create Atom with glow effect
function createAtom(group, x, y, z, size, color, label) {
    const geometry = new THREE.SphereGeometry(size, 32, 32);
    const material = new THREE.MeshPhongMaterial({
        color: color,
        shininess: 100,
        emissive: color,
        emissiveIntensity: 0.2
    });
    const atom = new THREE.Mesh(geometry, material);
    atom.position.set(x, y, z);
    atom.castShadow = true;
    atom.receiveShadow = true;

    // Add glow effect
    const glowGeometry = new THREE.SphereGeometry(size * 1.4, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.15
    });
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    atom.add(glowMesh);

    group.add(atom);
}

// Create Bond
function createBond(group, pos1, pos2, color, thickness) {
    const distance = pos1.distanceTo(pos2);
    const geometry = new THREE.CylinderGeometry(thickness, thickness, distance, 16);
    const material = new THREE.MeshPhongMaterial({
        color: color,
        shininess: 50
    });
    const bond = new THREE.Mesh(geometry, material);

    const midpoint = new THREE.Vector3().addVectors(pos1, pos2).multiplyScalar(0.5);
    bond.position.copy(midpoint);

    const direction = new THREE.Vector3().subVectors(pos2, pos1).normalize();
    bond.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);

    bond.castShadow = true;
    group.add(bond);
}

// Toggle Auto-Rotation
function toggleRotation(type) {
    autoRotate[type] = !autoRotate[type];
}

// Reset View
function resetView(type) {
    if (molecules[type]) {
        molecules[type].rotation.set(0, 0, 0);
        cameras[type].position.z = 20;
        autoRotate[type] = true;
    }
}

// Handle window resize
window.addEventListener('resize', () => {
    ['isotactic', 'atactic', 'syndiotactic'].forEach(type => {
        const container = document.getElementById(`canvas-${type}`);
        if (container && renderers[type]) {
            const width = container.clientWidth;
            const height = container.clientHeight;
            cameras[type].aspect = width / height;
            cameras[type].updateProjectionMatrix();
            renderers[type].setSize(width, height);
        }
    });
});