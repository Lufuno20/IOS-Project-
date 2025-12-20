/***************************************************
 * BASIC THREE.JS + WEBXR SETUP
 ***************************************************/

// Create a scene (holds all 3D objects)
const scene = new THREE.Scene();

// Create a camera (user’s viewpoint)
const camera = new THREE.PerspectiveCamera(
    75,                                     // Field of view
    window.innerWidth / window.innerHeight, // Aspect ratio
    0.1,                                    // Near clip
    1000                                    // Far clip
);

// Create the WebGL renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });

// Enable WebXR support (REQUIRED for WebXR)
renderer.xr.enabled = true;

// Set renderer size
renderer.setSize(window.innerWidth, window.innerHeight);

// Add renderer canvas to page
document.body.appendChild(renderer.domElement);

/***************************************************
 * WEBXR ENTRY BUTTON (XRButton)
 ***************************************************/

// Only attempt WebXR if supported
if (navigator.xr) {
    import('https://unpkg.com/three@0.158.0/examples/jsm/webxr/XRButton.js')
        .then((module) => {
            const xrButton = module.XRButton.createButton(renderer);
            document.body.appendChild(xrButton);
            console.log('WebXR supported');
        })
        .catch((err) => {
            console.error('XRButton failed to load', err);
        });
} else {
    console.warn('WebXR not supported on this device');
}

/***************************************************
 * 3D OBJECT (CUBE)
 ***************************************************/

// Geometry defines shape
const geometry = new THREE.BoxGeometry();

// Material defines appearance
const material = new THREE.MeshNormalMaterial();

// Mesh combines geometry + material
const cube = new THREE.Mesh(geometry, material);

// Add cube to scene
scene.add(cube);

// Move camera back so cube is visible
camera.position.z = 3;

/***************************************************
 * RENDER LOOP (WebXR-compatible)
 ***************************************************/

// setAnimationLoop is REQUIRED for WebXR
renderer.setAnimationLoop(() => {

    // Rotate cube continuously
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    // Render the scene
    renderer.render(scene, camera);
});

/***************************************************
 * NATIVE (iOS) → JAVASCRIPT FUNCTIONS
 ***************************************************/

// Called by native Swift button
function startAnimation() {
    cube.rotation.set(0, 0, 0);
    sendToIOS('Animation started');
}

// Called by native Swift button
function resetScene() {
    cube.rotation.set(0, 0, 0);
    sendToIOS('Scene reset');
}

/***************************************************
 * JAVASCRIPT → NATIVE (iOS WKWebView BRIDGE)
 ***************************************************/
function sendToIOS(message) {

    // Check if running inside iOS WKWebView
    if (window.webkit && window.webkit.messageHandlers) {

        // Send message to Swift
        window.webkit.messageHandlers.iosListener.postMessage(message);

    } else {
        // Browser fallback for development/testing
        console.log('[iOS MOCK]', message);
        document.getElementById('status').innerText = message;
    }
}

/***************************************************
 * NATIVE (iOS) → JAVASCRIPT CALLBACK
 ***************************************************/

// Called from Swift using evaluateJavaScript(...)
function messageFromIOS(text) {
    document.getElementById('status').innerText = text;
}

/***************************************************
 * HANDLE WINDOW RESIZE
 ***************************************************/
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
