import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// Camera
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(-1, 1.7, 4.3);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setAnimationLoop(() => {
  const delta = Math.min(0.05, clock.getDelta()); // Smooth delta
  if (mixer) mixer.update(delta);
  controls.update();
  renderer.render(scene, camera);
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Lighting
const ambientLight = new THREE.AmbientLight(0x00f0ff, 0.08); // Neon blue tint
scene.add(ambientLight);



// Glow material with emissive properties for shine
const glowMaterial = new THREE.MeshStandardMaterial({
    color: 0x00f0ff,      // Color of the glow
    emissive: 0x00f0ff,   // Makes the object glow
    emissiveIntensity: 10, // Increase the emissive intensity for a stronger shine
    transparent: true,
    opacity: 0.5,         // Adjust opacity for transparency effect
    roughness: 0.2,       // Control roughness for smooth surface
    metalness: 0.5        // Optional: give it a slightly metallic look
  });
  
  // Create the glowing base circle
  const glowBase = new THREE.CircleGeometry(0.5, 32); // You can increase size for a larger glow
  const glowMesh = new THREE.Mesh(glowBase, glowMaterial);
  glowMesh.rotation.x = -Math.PI / 2; // Rotate it flat
  glowMesh.position.y = -0.2;         // Position it slightly below the model
  
  scene.add(glowMesh);
  
  // Optional: Add a Point Light for extra shine
  const glowLight = new THREE.PointLight(0x00f0ff, 3, 10, 2); // Intensity, distance, and decay
  glowLight.position.set(0, -0.2, 0); // Position the light under the model
  scene.add(glowLight);

  // Inside your animate() function


// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05; // Lower for smoother damping
controls.rotateSpeed = 0.4;    // Lower to slow down rotation
controls.zoomSpeed = 0.2;      // Optional: slow down zoom
controls.panSpeed = 0.2;       // Optional: slow down panning
controls.enableZoom = false;   // Optional: disable zoom if undesired
controls.enablePan = false;    // Optional: disable panning


let mixer;

let modelGroup = new THREE.Group(); // Group to hold model
scene.add(modelGroup);

const loader = new GLTFLoader();
loader.load(
  'assets/models/darkeyeupdate.glb',
  (gltf) => {
    const model = gltf.scene;
    model.scale.set(1, 1, 1);
    modelGroup.add(model); // Add model to group instead of directly to scene

    if (gltf.animations && gltf.animations.length) {
      mixer = new THREE.AnimationMixer(model);
      gltf.animations.forEach((clip) => {
        mixer.clipAction(clip).play();
      });
    }
  },

);



// Clock for animation timing
const clock = new THREE.Clock();

// Animate
function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(0.05, clock.getDelta());
  if (mixer) mixer.update(delta);


  modelGroup.rotation.y -= 0.001; // Slow opposite (counterclockwise) rotation

  

const time = performance.now() * 0.001; // Time in seconds

// Flicker with random slight spikes occasionally
const flicker = Math.random() < 0.03 ? Math.random() * 0.5 : 2;

// Base + flicker using sine for smooth variation + occasional random pulse
const baseIntensity = 3 + Math.sin(time * 5) * 0.2 + flicker;
glowLight.intensity = baseIntensity;

// Optional: also flicker emissive intensity on glowMesh material
glowMaterial.emissiveIntensity = 8 + Math.sin(time * 5) * 0.5 + flicker;

  

  controls.update();
  renderer.render(scene, camera);
}
animate();

// Handle resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});


document.addEventListener('DOMContentLoaded', () => {

    const availableFields = [
    'name', 'email', 'username', 'domain', 'phone',
    'Id Number','country'
    ];

    // --- State ---
    let selectedFields = ['email']; // Start with all selected
    let currentSearchTerm = '';
    let isLoading = false;

    // --- DOM Elements ---
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const fieldButtonsContainer = document.getElementById('field-buttons-container');
    const resultsContainer = document.getElementById('results-container');
    const selectedFieldCountSpan = document.getElementById('selected-field-count');
    const totalFieldCountSpan = document.getElementById('total-field-count');
    const loadingIndicator = document.getElementById('loading-indicator');
    const noResultsMessage = document.getElementById('no-results-message');
    const initialMessage = document.getElementById('initial-message');

    // --- Helper Functions ---
    function formatFieldName(fieldName) {
    const result = fieldName.replace(/([A-Z])/g, ' $1');
    return result.charAt(0).toUpperCase() + result.slice(1);
    }

    function updateFieldCounter() {
    selectedFieldCountSpan.textContent = selectedFields.length;
    totalFieldCountSpan.textContent = availableFields.length;
    }

    function renderFieldButtons() {
    fieldButtonsContainer.innerHTML = ''; // Clear existing
    availableFields.forEach(field => {
    const button = document.createElement('button');
    button.dataset.field = field; // Store field name in data attribute
    button.className = `field-button px-3 py-1 border rounded-md text-xs transition-all duration-200 flex items-center space-x-1.5`;

    const span = document.createElement('span');
    span.textContent = formatFieldName(field);
    button.appendChild(span);

    const icon = document.createElement('i');
    icon.className = 'fas fa-check text-xs';
    icon.style.display = 'none'; // Hide check initially
    button.appendChild(icon);

    if (selectedFields.includes(field)) {
    button.classList.add('selected');
    icon.style.display = 'inline-block';
    }

    fieldButtonsContainer.appendChild(button);
    });
    updateFieldCounter();
    }

    function toggleField(field, buttonElement) {
    const icon = buttonElement.querySelector('i');
    if (selectedFields.includes(field)) {
    selectedFields = selectedFields.filter(f => f !== field);
    buttonElement.classList.remove('selected');
    if (icon) icon.style.display = 'none';
    } else {
    selectedFields.push(field);
    buttonElement.classList.add('selected');
    if (icon) icon.style.display = 'inline-block';
    }
    updateFieldCounter();
    }

function renderResults(data) {
    resultsContainer.innerHTML = ''; // Clear previous results
    initialMessage.style.display = 'none'; // Hide initial message
    noResultsMessage.style.display = 'none'; // Hide no results message

    const sources = data.sources || [];

    if (sources.length === 0) {
        if (currentSearchTerm.trim() && selectedFields.length > 0) {
            noResultsMessage.textContent = 'No matching signals found in the network for the selected fields.';
            noResultsMessage.style.display = 'block';
        } else if (currentSearchTerm.trim() && selectedFields.length === 0) {
            noResultsMessage.textContent = 'Warning: No scan fields selected.';
            noResultsMessage.style.display = 'block';
        } else {
            // No search term, show initial message again
            initialMessage.style.display = 'block';
        }
        return;
    }

    const sanitize = (str) => {
        if (!str) return 'N/A';
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    };

    const formatDate = (rawDate) => {
        if (!rawDate) return 'N/A';
        const date = new Date(rawDate);
        return isNaN(date) ? rawDate : date.toLocaleDateString('es-ES');
    };

    const truncateText = (text, maxLength) => {
    if (!text) return 'N/A';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

    // Crear una tarjeta para cada fuente
    sources.forEach(source => {
        const card = document.createElement('div');
        card.className = `p-4 border rounded-lg synthwave-container-bg synthwave-border-subtle hover:border-pink-500 hover:synthwave-shadow-accent transition-all duration-300 flex flex-col backdrop-blur-sm`;

        card.innerHTML = `
        <h3 class="text-lg font-bold mb-2 synthwave-accent-pink">🔍 Leaked Data Source</h3>
        <div class="space-y-2 mt-auto text-sm break-words">
            <p class="synthwave-accent-cyan flex items-start">
                <i class="fas fa-database fa-fw mr-2 mt-1 w-4 text-center opacity-60"></i>
                <span>Found: <strong>${sanitize(source.doc_count)}</strong> documents</span>
            </p>
            <p class="synthwave-accent-cyan flex items-start">
                <i class="fas fa-file-alt fa-fw mr-2 mt-1 w-4 text-center opacity-60"></i>
                <span>Title: ${sanitize(source.post_title)}</span>
            </p>
            <p class="synthwave-accent-cyan flex items-start">
                <i class="fas fa-calendar-alt fa-fw mr-2 mt-1 w-4 text-center opacity-60"></i>
                <span>Discovered: ${sanitize(formatDate(source.discovered))}</span>
            </p>
            <p class="synthwave-accent-cyan flex items-start">
                <i class="fas fa-flag fa-fw mr-2 mt-1 w-4 text-center opacity-60"></i>
                <span>Country: ${sanitize(source.country)}</span>
            </p>
            <p class="synthwave-accent-cyan flex items-start">
                <i class="fas fa-users fa-fw mr-2 mt-1 w-4 text-center opacity-60"></i>
                <span>Group: ${sanitize(source.group_name)}</span>
            </p>
            <p class="synthwave-accent-cyan flex items-start">
                <i class="fas fa-file-lines fa-fw mr-2 mt-1 w-4 text-center opacity-60"></i>
                <span>${sanitize(truncateText(source.description, 50))}</span>
            </p>
        </div>
        `;

        resultsContainer.appendChild(card);
    });
}

async function handleSearch() {
    if (isLoading) return;

    currentSearchTerm = searchInput.value.trim();
    if (!currentSearchTerm || selectedFields.length === 0) {
        alert("Please enter a search term and select at least one field.");
        return;
    }

    isLoading = true;
    loadingIndicator.style.display = 'block';
    resultsContainer.innerHTML = '';
    initialMessage.style.display = 'none';
    noResultsMessage.style.display = 'none';
    searchButton.disabled = true;
    searchButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Scan';

try {
    // Use the direct search endpoint
    const response = await fetch('/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            term: currentSearchTerm,
            fields: selectedFields
        })
    });

    // Obtener los datos de la respuesta primero para acceder a los mensajes de error
    const data = await response.json();

    // Verificar si hay un error específico de plan de negocio
    if (response.status === 403 && data.upgrade_required) {
        noResultsMessage.innerHTML = `
            <div class="text-center p-4">
                <i class="fas fa-lock text-2xl mb-2 text-pink-500"></i>
                <p class="font-bold text-pink-500">Premium Feature</p>
                <p class="mb-3">Domain and Country search is only available in our Business Plan</p>
                <a href="#upgrade" class="px-3 py-1 border border-pink-500 text-pink-500 rounded hover:bg-pink-500 hover:bg-opacity-20 transition-all duration-200">
                    <i class="fas fa-arrow-up mr-1"></i> Upgrade Now
                </a>
            </div>
        `;
        noResultsMessage.style.display = 'block';
        return;
    }

    // Verificar si hay un error de formato de email
    if (response.status === 400 && data.error && data.error.includes('Invalid email format')) {
        noResultsMessage.innerHTML = `
            <div class="text-center p-4">
                <i class="fas fa-exclamation-circle text-2xl mb-2 text-yellow-500"></i>
                <p class="font-bold text-yellow-500">Invalid Format</p>
                <p>Please enter a valid email address with @ and at least one character before it.</p>
            </div>
        `;
        noResultsMessage.style.display = 'block';
        return;
    }

    // Verificar si hay otros errores específicos del servidor
    if (!response.ok) {
        noResultsMessage.innerHTML = `
            <div class="text-center p-4">
                <i class="fas fa-exclamation-triangle text-2xl mb-2 text-red-500"></i>
                <p class="font-bold text-red-500">Error: ${response.status}</p>
                <p>${data.error || 'An unexpected error occurred'}</p>
            </div>
        `;
        noResultsMessage.style.display = 'block';
        return;
    }

    // Si llegamos aquí, la respuesta es exitosa
    renderResults(data);

} catch (err) {
    console.error('Request error:', err);
    
    // Error de red o de parsing JSON
    noResultsMessage.innerHTML = `
        <div class="text-center p-4">
            <i class="fas fa-wifi-slash text-2xl mb-2 text-red-500"></i>
            <p class="font-bold text-red-500">Connection Error</p>
            <p>Unable to connect to the server. Please check your internet connection and try again.</p>
        </div>
    `;
    noResultsMessage.style.display = 'block';
} finally {
    isLoading = false;
    loadingIndicator.style.display = 'none';
    searchButton.disabled = false;
    searchButton.innerHTML = '<i class="fas fa-search"></i> Scan';
}
}

    // --- Event Listeners ---
    searchButton.addEventListener('click', handleSearch);

    searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        handleSearch();
    }
    });

    // Use event delegation for field buttons
    fieldButtonsContainer.addEventListener('click', (event) => {
    const button = event.target.closest('.field-button');
    if (button && button.dataset.field) {
        toggleField(button.dataset.field, button);
    }
    });

    // --- Initial Setup ---
    renderFieldButtons(); // Create the buttons

    });
    
