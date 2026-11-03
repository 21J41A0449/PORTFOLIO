import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js';

// --- CONFIG & GLOBAL STATE ---
const state = {
  mouse: { x: 0, y: 0, targetX: 0, targetY: 0 },
  windowHalfX: window.innerWidth / 2,
  windowHalfY: window.innerHeight / 2
};

// --- LIFECYCLE INITIALIZATION ---
function bootstrap() {
  initBackgroundCanvas();
  initHeroCanvas();
  initScrollNav();
  initTiltCards();
  initWorkflowTabs();
  initRevealAnimations();
  initContactForm();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}

// Global mouse tracker for particle parallax
window.addEventListener('mousemove', (e) => {
  state.mouse.targetX = (e.clientX - state.windowHalfX) * 0.05;
  state.mouse.targetY = (e.clientY - state.windowHalfY) * 0.05;
});

window.addEventListener('resize', () => {
  state.windowHalfX = window.innerWidth / 2;
  state.windowHalfY = window.innerHeight / 2;
});


// --- 1. WEBGL BACKGROUND PARTICLE CANVAS (#bg-canvas) ---
function initBackgroundCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 32;

  // Particle System
  const particleCount = 220;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  // Palette: Electric Lime (#AEFF00) and Hot Coral (#FF4D6D)
  const color1 = new THREE.Color(0xaeff00);
  const color2 = new THREE.Color(0xff4d6d);

  for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 65;
    positions[i + 1] = (Math.random() - 0.5) * 65;
    positions[i + 2] = (Math.random() - 0.5) * 45 - 8;

    const ratio = Math.random();
    const mixed = color1.clone().lerp(color2, ratio);
    colors[i] = mixed.r;
    colors[i + 1] = mixed.g;
    colors[i + 2] = mixed.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.28,
    vertexColors: true,
    transparent: true,
    opacity: 0.45,
    blending: THREE.AdditiveBlending
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  function animate() {
    requestAnimationFrame(animate);

    particles.rotation.y += 0.0003;
    particles.rotation.x += 0.00015;

    // Smooth mouse parallax damping
    state.mouse.x += (state.mouse.targetX - state.mouse.x) * 0.04;
    state.mouse.y += (state.mouse.targetY - state.mouse.y) * 0.04;

    camera.position.x = state.mouse.x * 0.06;
    camera.position.y = -state.mouse.y * 0.06;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }

  animate();
}


// --- 2. HERO 3D INTERACTIVE CORE (#hero-canvas) ---
function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const parent = canvas.parentElement;
  const width = parent.clientWidth || 450;
  const height = parent.clientHeight || 450;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.z = 7;

  // Root interactive group
  const coreGroup = new THREE.Group();
  scene.add(coreGroup);

  // 1. Inner Luminous Core (Electric Lime / Warm Gold)
  const innerGeo = new THREE.SphereGeometry(0.85, 32, 32);
  const innerMat = new THREE.MeshStandardMaterial({
    color: 0xaeff00,
    emissive: 0x4f8000,
    emissiveIntensity: 1.1,
    roughness: 0.15,
    metalness: 0.85
  });
  const innerMesh = new THREE.Mesh(innerGeo, innerMat);
  coreGroup.add(innerMesh);

  // 2. Middle Wireframe Shell (Hot Coral / Gold)
  const middleGeo = new THREE.IcosahedronGeometry(1.48, 2);
  const middleMat = new THREE.MeshStandardMaterial({
    color: 0xff4d6d,
    emissive: 0x6e0e22,
    emissiveIntensity: 0.6,
    wireframe: true,
    transparent: true,
    opacity: 0.4
  });
  const middleMesh = new THREE.Mesh(middleGeo, middleMat);
  coreGroup.add(middleMesh);

  // 3. Dual Orbital Rings
  const ring1Geo = new THREE.TorusGeometry(1.95, 0.02, 16, 120);
  const ring1Mat = new THREE.MeshBasicMaterial({
    color: 0xaeff00,
    transparent: true,
    opacity: 0.75,
    side: THREE.DoubleSide
  });
  const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
  ring1.rotation.x = Math.PI / 3;
  coreGroup.add(ring1);

  const ring2Geo = new THREE.TorusGeometry(2.25, 0.018, 16, 120);
  const ring2Mat = new THREE.MeshBasicMaterial({
    color: 0xffb800,
    transparent: true,
    opacity: 0.55,
    side: THREE.DoubleSide
  });
  const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
  ring2.rotation.y = Math.PI / 3.8;
  coreGroup.add(ring2);

  // 4. Floating Satellite Nodes
  const nodeCount = 14;
  const nodesGroup = new THREE.Group();
  const nodeGeo = new THREE.SphereGeometry(0.055, 16, 16);
  const nodeMat = new THREE.MeshBasicMaterial({ color: 0xf8fcff });

  for (let i = 0; i < nodeCount; i++) {
    const node = new THREE.Mesh(nodeGeo, nodeMat);
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    const r = 1.5;

    node.position.x = r * Math.sin(phi) * Math.cos(theta);
    node.position.y = r * Math.sin(phi) * Math.sin(theta);
    node.position.z = r * Math.cos(phi);
    nodesGroup.add(node);
  }
  coreGroup.add(nodesGroup);

  // Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.45);
  scene.add(ambient);

  const lightLime = new THREE.PointLight(0xaeff00, 3, 16);
  lightLime.position.set(3.5, 3.5, 3.5);
  scene.add(lightLime);

  const lightCoral = new THREE.PointLight(0xff4d6d, 2.5, 16);
  lightCoral.position.set(-3.5, -3.5, 3.5);
  scene.add(lightCoral);

  // Drag Interaction
  let isDragging = false;
  let prevPos = { x: 0, y: 0 };
  let targetRot = { x: 0, y: 0 };
  let curRot = { x: 0, y: 0 };
  let vel = { x: 0.003, y: 0.004 };

  const startDrag = (x, y) => {
    isDragging = true;
    prevPos = { x, y };
  };

  const moveDrag = (x, y) => {
    if (!isDragging) return;
    const dx = x - prevPos.x;
    const dy = y - prevPos.y;
    targetRot.y += dx * 0.006;
    targetRot.x += dy * 0.006;
    prevPos = { x, y };
  };

  const endDrag = () => { isDragging = false; };

  canvas.addEventListener('mousedown', (e) => startDrag(e.clientX, e.clientY));
  window.addEventListener('mousemove', (e) => moveDrag(e.clientX, e.clientY));
  window.addEventListener('mouseup', endDrag);

  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) startDrag(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1) moveDrag(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  window.addEventListener('touchend', endDrag);

  // Resize
  window.addEventListener('resize', () => {
    const w = parent.clientWidth || 450;
    const h = parent.clientHeight || 450;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });

  // Animation Loop
  function animate() {
    requestAnimationFrame(animate);

    if (!isDragging) {
      vel.x += (0.002 - vel.x) * 0.05;
      vel.y += (0.004 - vel.y) * 0.05;
      targetRot.x += vel.x;
      targetRot.y += vel.y;
    }

    curRot.x += (targetRot.x - curRot.x) * 0.1;
    curRot.y += (targetRot.y - curRot.y) * 0.1;

    coreGroup.rotation.x = curRot.x;
    coreGroup.rotation.y = curRot.y;

    innerMesh.rotation.y -= 0.012;
    middleMesh.rotation.y += 0.003;
    ring1.rotation.z += 0.01;
    ring2.rotation.z -= 0.007;
    nodesGroup.rotation.x -= 0.0015;

    // Organic breathing pulsation
    const time = Date.now() * 0.0016;
    const pulse = Math.sin(time) * 0.045 + 1.0;
    innerMesh.scale.set(pulse, pulse, pulse);

    renderer.render(scene, camera);
  }

  animate();
}


// --- 3. SCROLL NAVIGATION & STICKY HEADER ---
function initScrollNav() {
  const header = document.getElementById('site-header');
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('section');

  window.addEventListener('scroll', () => {
    if (header) {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    // Active Section Tracker
    let currentId = '';
    sections.forEach((sec) => {
      const top = sec.offsetTop;
      if (window.scrollY >= top - 180) {
        currentId = sec.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href && href.slice(1) === currentId) {
        link.classList.add('active');
      }
    });
  }, { passive: true });
}


// --- 4. 3D CARD TILT & MAGNETIC LIGHT GLOW ---
function initTiltCards() {
  const cards = document.querySelectorAll('.svc-card, .tech-card');

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Update CSS spotlight variables
      card.style.setProperty('--mx', `${x}px`);
      card.style.setProperty('--my', `${y}px`);

      // 3D Tilt calculation
      const tiltX = (y - rect.height / 2) / (rect.height / 2);
      const tiltY = -(x - rect.width / 2) / (rect.width / 2);
      const maxTilt = 6;

      card.style.transform = `perspective(800px) rotateX(${tiltX * maxTilt}deg) rotateY(${tiltY * maxTilt}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0)';
      card.style.setProperty('--mx', '0px');
      card.style.setProperty('--my', '0px');
    });
  });
}


// --- 5. WORKFLOW ARCHITECTURE TABS ---
function initWorkflowTabs() {
  const tabBtns = document.querySelectorAll('.workflow-tab-btn');
  const panels = document.querySelectorAll('.workflow-panel');

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      if (!targetId) return;

      tabBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      panels.forEach((p) => {
        p.classList.remove('active');
        if (p.id === targetId) {
          p.classList.add('active');
        }
      });
    });
  });
}


// --- 6. SCROLL REVEAL & METRIC COUNTERS ---
function initRevealAnimations() {
  const reveals = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view', 'active');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -40px 0px', threshold: 0.1 });

  reveals.forEach((el) => observer.observe(el));

  // Animate Hero Metric Numbers
  const metrics = [
    { id: 'stat-efficiency', target: 95, suffix: '%' },
    { id: 'stat-speed', target: 10, suffix: 'x' },
    { id: 'stat-availability', target: 24, suffix: '/7' }
  ];

  let animated = false;
  const heroContent = document.getElementById('hero-content');
  if (heroContent) {
    const statObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !animated) {
        animated = true;
        metrics.forEach((m) => {
          const el = document.getElementById(m.id);
          if (!el) return;
          let current = 0;
          const stepTime = 1800 / m.target;
          const timer = setInterval(() => {
            current++;
            if (current >= m.target) {
              current = m.target;
              clearInterval(timer);
            }
            el.textContent = `${current}${m.suffix}`;
          }, stepTime);
        });
        statObserver.unobserve(heroContent);
      }
    }, { threshold: 0.3 });

    statObserver.observe(heroContent);
  }
}


// --- 7. CONSULTATION / HIRE FORM HANDLER ---
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-submit');
    const span = btn ? btn.querySelector('span') : null;
    const originalText = span ? span.textContent : 'Send Project Inquiry';

    if (btn) {
      btn.disabled = true;
      if (span) span.textContent = 'Transmitting Inquiry...';
    }

    setTimeout(() => {
      alert('Thank you! Your n8n project inquiry has been securely sent. I will review your requirements and get back to you within 24 hours at hafsiya29@gmail.com.');
      form.reset();
      if (btn) {
        btn.disabled = false;
        if (span) span.textContent = originalText;
      }
    }, 1200);
  });
}
