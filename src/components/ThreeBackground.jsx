import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const CAMERA_Z = 14;
const LOOK_AT_Y = 2;
const FOV_DEG = 55;
const OVERSCAN = 1.18;

// Vertical slices of the same source photo, each rendered as its own flat
// plane at a different depth. No 3D models: every visual comes straight
// from public/calm-background.jpg.
const LAYER_DEFS = [
  { name: "sky", z: -20, yFrac: [0, 0.63], masked: false },
  { name: "mid", z: -4, yFrac: [0.34, 0.86], masked: true },
  { name: "water", z: 6, yFrac: [0.56, 1], masked: false },
];

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl2") || canvas.getContext("webgl"))
    );
  } catch {
    return false;
  }
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Crops a vertical band [y0,y1] (fractions of image height) from the
// source image. For the masked "mid" band, near-black silhouette pixels
// (the tree, island, and its reflection) are kept opaque while everything
// else (sky/water) is faded to transparent, so only the silhouette floats
// on its own plane.
function buildLayerCanvas(img, yFrac, masked) {
  const sw = img.width;
  const sy = Math.round(yFrac[0] * img.height);
  const sh = Math.round((yFrac[1] - yFrac[0]) * img.height);

  const canvas = document.createElement("canvas");
  canvas.width = sw;
  canvas.height = sh;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, sy, sw, sh, 0, 0, sw, sh);

  if (masked) {
    const imageData = ctx.getImageData(0, 0, sw, sh);
    const d = imageData.data;
    const THRESH_LOW = 26;
    const THRESH_HIGH = 42;
    for (let i = 0; i < d.length; i += 4) {
      const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      let alpha;
      if (lum <= THRESH_LOW) alpha = 255;
      else if (lum >= THRESH_HIGH) alpha = 0;
      else alpha = Math.round(255 * (1 - (lum - THRESH_LOW) / (THRESH_HIGH - THRESH_LOW)));
      d[i + 3] = alpha;
    }
    ctx.putImageData(imageData, 0, 0);
  }

  return { canvas, aspect: sw / sh };
}

export default function ThreeBackground() {
  const mountRef = useRef(null);
  const [webglOk] = useState(supportsWebGL);

  useEffect(() => {
    if (!webglOk) return;
    const mount = mountRef.current;
    if (!mount) return;
    let cancelled = false;

    const isSmall = window.innerWidth < 640;
    const fovRad = (FOV_DEG * Math.PI) / 180;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      FOV_DEG,
      mount.clientWidth / mount.clientHeight,
      0.1,
      200
    );
    const lookTarget = new THREE.Vector3(0, LOOK_AT_Y, 0);
    camera.position.set(0, LOOK_AT_Y, CAMERA_Z);
    camera.lookAt(lookTarget);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "low-power",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isSmall ? 1.5 : 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    /* ---------------- stars (far particle layer) ---------------- */
    const starCount = isSmall ? 220 : 420;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const radius = 40 + Math.random() * 40;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * 0.55 * Math.PI * 0.9;
      starPositions[i * 3] = Math.cos(theta) * radius * Math.sin(phi + 0.2);
      starPositions[i * 3 + 1] = 6 + Math.random() * 24;
      starPositions[i * 3 + 2] = -Math.sin(theta) * radius * Math.sin(phi + 0.2) - 15;
    }
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.09,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.85,
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    /* ---------------- fireflies (near particle layer, warm flicker) ---------------- */
    const fireflyCount = isSmall ? 20 : 36;
    const fireflyGeometry = new THREE.BufferGeometry();
    const fireflyPositions = new Float32Array(fireflyCount * 3);
    const fireflySeeds = new Float32Array(fireflyCount);
    for (let i = 0; i < fireflyCount; i++) {
      fireflyPositions[i * 3] = (Math.random() - 0.5) * 5.5;
      fireflyPositions[i * 3 + 1] = Math.random() * 2.2 + 0.4;
      fireflyPositions[i * 3 + 2] = Math.random() * 2.5 + 1.5;
      fireflySeeds[i] = Math.random() * Math.PI * 2;
    }
    fireflyGeometry.setAttribute("position", new THREE.BufferAttribute(fireflyPositions, 3));
    const fireflyMaterial = new THREE.PointsMaterial({
      color: 0xd7f9a6,
      size: 0.075,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const fireflies = new THREE.Points(fireflyGeometry, fireflyMaterial);
    scene.add(fireflies);

    /* ---------------- image parallax layers ---------------- */
    const layerMeshes = [];

    const fitLayer = (layer) => {
      const d = CAMERA_Z - layer.z;
      const frustumHeight = 2 * d * Math.tan(fovRad / 2);
      const frustumWidth = frustumHeight * camera.aspect;
      const bandFrac = layer.yFrac[1] - layer.yFrac[0];
      const targetHeight = frustumHeight * bandFrac;
      const targetWidth = frustumWidth;

      let planeWidth;
      let planeHeight;
      if (targetWidth / targetHeight > layer.aspect) {
        planeWidth = targetWidth * OVERSCAN;
        planeHeight = planeWidth / layer.aspect;
      } else {
        planeHeight = targetHeight * OVERSCAN;
        planeWidth = planeHeight * layer.aspect;
      }

      const centerFrac = (layer.yFrac[0] + layer.yFrac[1]) / 2;
      const worldY = LOOK_AT_Y + (0.5 - centerFrac) * frustumHeight;

      layer.mesh.scale.set(planeWidth, planeHeight, 1);
      layer.mesh.position.set(0, worldY, layer.z);
    };

    (async () => {
      try {
        const img = await loadImage("/calm-background.jpg");
        if (cancelled) return;

        LAYER_DEFS.forEach((def) => {
          const { canvas, aspect } = buildLayerCanvas(img, def.yFrac, def.masked);
          const texture = new THREE.CanvasTexture(canvas);
          texture.colorSpace = THREE.SRGBColorSpace;
          const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: def.masked,
            depthWrite: !def.masked,
          });
          const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
          scene.add(mesh);

          const layer = { ...def, aspect, mesh, texture, canvas };
          layerMeshes.push(layer);
          fitLayer(layer);
        });
      } catch {
        // If the photo fails to load, the particle layers still render on
        // top of the page's own dark gradient background.
      }
    })();

    /* ---------------- pointer / drag parallax tilt ---------------- */
    const targetPointer = { x: 0, y: 0 };
    const currentPointer = { x: 0, y: 0 };

    const handlePointerMove = (e) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      targetPointer.x = THREE.MathUtils.clamp(nx, -1, 1);
      targetPointer.y = THREE.MathUtils.clamp(ny, -1, 1);
    };
    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    /* ---------------- animation loop ---------------- */
    const clock = new THREE.Clock();
    let frameId;

    const animate = () => {
      const t = clock.getElapsedTime();

      // fireflies: slow wander + flicker
      const flyPos = fireflyGeometry.attributes.position.array;
      for (let i = 0; i < fireflyCount; i++) {
        const seed = fireflySeeds[i];
        flyPos[i * 3] += Math.sin(t * 0.6 + seed) * 0.0016;
        flyPos[i * 3 + 1] += Math.cos(t * 0.9 + seed * 1.3) * 0.0014;
        flyPos[i * 3 + 2] += Math.sin(t * 0.4 + seed * 0.7) * 0.001;
      }
      fireflyGeometry.attributes.position.needsUpdate = true;
      fireflyMaterial.opacity = 0.55 + Math.sin(t * 3 + fireflySeeds[0]) * 0.25;

      // twinkle
      starMaterial.opacity = 0.7 + Math.sin(t * 0.8) * 0.12;

      // smooth pointer / drag driven parallax tilt, blended with a gentle idle drift
      currentPointer.x += (targetPointer.x - currentPointer.x) * 0.055;
      currentPointer.y += (targetPointer.y - currentPointer.y) * 0.055;

      const idleX = Math.sin(t * 0.08) * 0.25;
      const idleY = Math.sin(t * 0.12) * 0.1;

      camera.position.x = currentPointer.x * 1.6 + idleX;
      camera.position.y = LOOK_AT_Y - currentPointer.y * 0.9 + idleY;
      camera.rotation.z = -currentPointer.x * 0.025;
      camera.lookAt(lookTarget);

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      layerMeshes.forEach(fitLayer);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handlePointerMove);
      mount.removeChild(renderer.domElement);
      starGeometry.dispose();
      fireflyGeometry.dispose();
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (obj.material.map) obj.material.map.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
      renderer.dispose();
    };
  }, [webglOk]);

  if (!webglOk) {
    return (
      <img
        src="/calm-background.jpg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 w-full h-full object-cover opacity-55"
      />
    );
  }

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 w-full h-full"
    />
  );
}
