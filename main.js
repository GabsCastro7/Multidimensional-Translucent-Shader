import * as THREE from 'three';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Audio setup
let audioContext, analyser, dataArray, audioSource;

// Initialize scene
function init() {
  // Add your scene initialization code here
  // ...
}

// Audio functions
async function setupAudio(youtubeId) {
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    dataArray = new Uint8Array(analyser.frequencyBinCount);

    const response = await fetch(`/api/youtube-audio?id=${youtubeId}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const audioData = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(audioData);

    audioSource = audioContext.createBufferSource();
    audioSource.buffer = audioBuffer;
    audioSource.connect(analyser);
    analyser.connect(audioContext.destination);
    audioSource.start(0);

    audioSource.onended = () => console.log('Audio playback ended');
    audioSource.onerror = (error) => console.error('Audio source error:', error);
  } catch (error) {
    console.error('Audio setup failed:', error);
    if (audioSource) audioSource.disconnect();
    if (analyser) analyser.disconnect();
    if (audioContext) await audioContext.close();
  }
}

function updateAudioReactivity() {
  if (!analyser || !dataArray || !audioSource) return;

  try {
    analyser.getByteFrequencyData(dataArray);
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
    const sensitivity = parseFloat(document.getElementById('audioSensitivity').value) || 1.0;
    const normalizedValue = (average / 255) * sensitivity;

    // Apply reactivity to visual elements
    // ...
  } catch (error) {
    console.error('Error in audio reactivity:', error);
  }
}

// Event listeners
document.getElementById('connectAudio').addEventListener('click', () => {
  const url = document.getElementById('youtubeUrl').value;
  const videoId = url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/)?.[1];
  if (videoId) setupAudio(videoId);
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  updateAudioReactivity();
  renderer.render(scene, camera);
}

// Initialize and start
init();
animate();
