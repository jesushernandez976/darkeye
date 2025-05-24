import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { gsap } from "https://cdn.skypack.dev/gsap@3.9.1";

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



const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setAnimationLoop(() => {
    const delta = Math.min(0.05, clock.getDelta()); 
    if (mixer) mixer.update(delta);
    controls.update();
    renderer.render(scene, camera);
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Lighting
const ambientLight = new THREE.AmbientLight(0x00f0ff, 0.08); 
scene.add(ambientLight);



const glowMaterial = new THREE.MeshStandardMaterial({
    color: 0x00f0ff,     
    emissive: 0x00f0ff,   
    emissiveIntensity: 10, 
    transparent: true,
    opacity: 0.5,         
    roughness: 0.2,       
    metalness: 0.5        
});

const glowBase = new THREE.CircleGeometry(0.5, 32);
const glowMesh = new THREE.Mesh(glowBase, glowMaterial);
glowMesh.rotation.x = -Math.PI / 2; 
glowMesh.position.y = -0.2;         

scene.add(glowMesh);

const glowLight = new THREE.PointLight(0x00f0ff, 3, 10, 2); 
glowLight.position.set(0, -0.2, 0); 
scene.add(glowLight);



const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05; 
controls.rotateSpeed = 0.4;   
controls.zoomSpeed = 0.2;      
controls.panSpeed = 0.2;       
controls.enableZoom = false;   
controls.enablePan = false;    


let mixer;
let modelGroup = new THREE.Group(); 
scene.add(modelGroup);

const loadingScreen = document.getElementById('loading-screen');
const loadingPercentage = document.getElementById('loading-percentage');

const loader = new GLTFLoader();
loader.load(
    'assets/models/darkeyeupdate.glb',
    (gltf) => {
        const model = gltf.scene;
        model.scale.set(1, 1, 1);
        modelGroup.add(model); 

        if (gltf.animations && gltf.animations.length) {
            mixer = new THREE.AnimationMixer(model);
            gltf.animations.forEach((clip) => {
                mixer.clipAction(clip).play();
            });
        }

        gsap.to(loadingScreen, {
            opacity: 0,
            duration: 1,
            onComplete: () => {
                loadingScreen.style.display = 'none';
                startCameraAnimation();
            }
        });
    },
    (xhr) => {
        if (xhr.lengthComputable) {
            const percent = (xhr.loaded / xhr.total) * 100;
            loadingPercentage.textContent = `${Math.round(percent)}%`;
        }
    },
    (error) => {
        console.error('Error loading GLB:', error);
    }
);

camera.position.set(-40, 10, 60);
camera.lookAt(0, 1.5, 0);

function startCameraAnimation() {
    gsap.to(camera.position, {
        x: 1,
        y: 1.7,
        z: 5.1,
        duration: 4.5,
        ease: "power2.out",
        onUpdate: () => {
            camera.lookAt(0, 1.5, 0);
        },
        onComplete: () => {
            document.querySelector('.container').style.display = 'flex';
        }
    });
}


const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const delta = Math.min(0.05, clock.getDelta());
    if (mixer) mixer.update(delta);


    modelGroup.rotation.y -= 0.001; 



    const time = performance.now() * 0.001; 

    const flicker = Math.random() < 0.03 ? Math.random() * 0.5 : 2;

    const baseIntensity = 3 + Math.sin(time * 5) * 0.2 + flicker;
    glowLight.intensity = baseIntensity;

    glowMaterial.emissiveIntensity = 8 + Math.sin(time * 5) * 0.5 + flicker;



    controls.update();
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});



document.addEventListener('DOMContentLoaded', () => {

    const availableFields = [
        'name', 'email', 'username', 'domain', 'phone',
        'Id Number', 'country', 'password', 'telegram User', 'Telegram Id', 'Ip Address', 'Metamask Wallet', 'Vpn Domain', 'Ftp Domain', 'Steam Username', 'steam'
    ];

    let selectedFields = []; 
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
        fieldButtonsContainer.innerHTML = '';
        availableFields.forEach(field => {
            const button = document.createElement('button');
            button.dataset.field = field; 
            button.className = `field-button px-3 py-1 border rounded-md text-xs transition-all duration-200 flex items-center space-x-1.5`;

            const span = document.createElement('span');
            span.textContent = formatFieldName(field);
            button.appendChild(span);

            const icon = document.createElement('i');
            icon.className = 'fas fa-check text-xs';
            icon.style.display = 'none'; 
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
    };



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

            const response = await fetch('/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    term: currentSearchTerm,
                    fields: selectedFields
                })
            });





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
            // Play click sound
            clickSound.currentTime = 0;
            clickSound.play();

            toggleField(button.dataset.field, button);
        }
    });


    // --- Initial Setup ---
    renderFieldButtons(); // Create the buttons

});

const hoverSound = new Audio('./assets/audio/Hover.mp3');
hoverSound.volume = 0.3;

const clickSound = new Audio('./assets/audio/Click.mp3');
clickSound.volume = 0.5;

const hoverSound2 = new Audio('./assets/audio/hover 2.mp3');
hoverSound2.volume = 0.5;

const allSounds = [hoverSound, clickSound, hoverSound2];

let soundMuted = false;

document.querySelector('.toggle-checkbox').addEventListener('change', function (e) {
    soundMuted = e.target.checked;

    allSounds.forEach(sound => {
        sound.muted = soundMuted;
    });

    console.log(soundMuted ? "🔇 Sounds Muted" : "🔊 Sounds Unmuted");
});

function playSound(audio) {
    if (!soundMuted) {
        audio.currentTime = 0;
        audio.play();
    }
}

document.getElementById('sound').addEventListener('mouseenter', function () {
    playSound(hoverSound2);
});

document.getElementById('sound').addEventListener('click', function () {
    playSound(clickSound);
});

const bodyContainer = document.querySelector('.body-container');
if (bodyContainer) {
    bodyContainer.addEventListener('mouseenter', () => {
        playSound(hoverSound2);
    });
}

const navLinks = document.querySelectorAll('.nav-link');

navLinks.forEach(link => {
    link.addEventListener('mouseenter', () => {
        playSound(hoverSound2);
    });
});

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        playSound(clickSound);
    });
});


const hamburgerBtn = document.getElementById('hamburgerBtn');
const navWrapper = document.getElementById('navWrapper');

hamburgerBtn.addEventListener('click', () => {
    navWrapper.classList.toggle('active');
    hamburgerBtn.classList.toggle('active');
});

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navWrapper.classList.remove('active');
        hamburgerBtn.classList.remove('active');
    });
});

let alarmsOn = false;
let redLights = [];
let flickerInterval = null;

function createAlarmLights(count = 20) {
    for (let i = 0; i < count; i++) {
        const light = new THREE.PointLight(0xff0000, 10, 150);

        const x = (Math.random() - 0.5) * 20;
        const y = Math.random() * 5 + 1;
        const z = (Math.random() - 0.5) * 20;

        light.position.set(x, y, z);
        light.visible = false;

        scene.add(light);
        redLights.push(light);
    }
}

document.addEventListener("keydown", (e) => {
    if (e.key === "1") {
        alarmsOn = !alarmsOn;
        toggleAlarms(alarmsOn);
    }
});

function toggleAlarms(isOn) {
    console.log(isOn ? "🚨 Alarms ON" : "🔕 Alarms OFF");

    redLights.forEach(light => {
        light.visible = isOn;
    });

    if (isOn) {
        startFlicker();
    } else {
        stopFlicker();
    }
}

function startFlicker() {
    flickerInterval = setInterval(() => {
        redLights.forEach(light => {
            light.intensity = Math.random() * 6 + 2;
        });
    }, 100);
}

function stopFlicker() {
    clearInterval(flickerInterval);
    redLights.forEach(light => {
        light.intensity = 5;
    });
}

createAlarmLights();





