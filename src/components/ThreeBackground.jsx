import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const CAMERA_Z = 14;
const LOOK_AT_Y = 2;
const FOV_DEG = 55;
// One cover-fit of the whole photo, generous enough that panning the camera
// never reaches a plane's edge.
const OVERSCAN = 1.35;
const REF_Z = 0;

// The photo is tiled into horizontal strips, each on its own flat plane at
// its own depth. No 3D models: every visual comes straight from
// public/calm-background.jpg.
//
// All strips are sized from one shared reference fit, so at rest they
// reconstruct the original photo exactly. Panning the camera shears them
// apart by depth, which is the parallax. Strip boundaries deliberately fall
// on featureless sky and water and cross-fade via the feather, and the tree
// sits entirely inside the middle strip so it is never duplicated.
const LAYER_DEFS = [
  { name: "sky", z: -22, yFrac: [0, 0.34], feather: { top: 0, bottom: 0.18 } },
  { name: "mid", z: -8, yFrac: [0.28, 0.96], feather: { top: 0.09, bottom: 0.06 } },
  { name: "water", z: 2, yFrac: [0.93, 1], feather: { top: 0.45, bottom: 0 } },
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

// Cuts the strip [y0,y1] (fractions of image height) out of the photo and
// fades its facing edges to transparent, so neighbouring strips cross-fade
// instead of meeting at a visible line.
function buildLayerCanvas(img, def) {
  const { yFrac, feather } = def;
  const sw = img.width;
  const sy = Math.round(yFrac[0] * img.height);
  const sh = Math.round((yFrac[1] - yFrac[0]) * img.height);

  const canvas = document.createElement("canvas");
  canvas.width = sw;
  canvas.height = sh;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, sy, sw, sh, 0, 0, sw, sh);

  const topFade = Math.round((feather?.top || 0) * sh);
  const bottomFade = Math.round((feather?.bottom || 0) * sh);

  if (topFade > 0 || bottomFade > 0) {
    const imageData = ctx.getImageData(0, 0, sw, sh);
    const d = imageData.data;
    for (let y = 0; y < sh; y++) {
      let a = 1;
      if (topFade > 0 && y < topFade) a = y / topFade;
      if (bottomFade > 0 && y > sh - bottomFade) a = Math.min(a, (sh - y) / bottomFade);
      if (a >= 1) continue;
      const alpha = Math.round(255 * a);
      for (let x = 0; x < sw; x++) d[(y * sw + x) * 4 + 3] = alpha;
    }
    ctx.putImageData(imageData, 0, 0);
  }

  return { canvas };
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
    starMaterial.depthTest = false;
    stars.renderOrder = 5;
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
    fireflyMaterial.depthTest = false;
    fireflies.renderOrder = 30;
    scene.add(fireflies);

    /* ---------------- image parallax layers ---------------- */
    const layerMeshes = [];
    let imageAspect = 16 / 10;

    // Cover-fit the whole photo once, at a single reference depth. Every
    // strip derives its size and position from this, so they all share one
    // scale and line up into the original image at rest.
    const referenceFit = () => {
      const dRef = CAMERA_Z - REF_Z;
      const frustumHeight = 2 * dRef * Math.tan(fovRad / 2);
      const frustumWidth = frustumHeight * camera.aspect;
      let width;
      let height;
      if (frustumWidth / frustumHeight > imageAspect) {
        width = frustumWidth * OVERSCAN;
        height = width / imageAspect;
      } else {
        height = frustumHeight * OVERSCAN;
        width = height * imageAspect;
      }
      return { width, height, dRef };
    };

    const fitLayer = (layer) => {
      const ref = referenceFit();
      const d = CAMERA_Z - layer.z;
      // Scale by depth ratio so the strip covers the same screen area it
      // would at the reference depth.
      const k = d / ref.dRef;

      const topY = LOOK_AT_Y + ref.height / 2 - layer.yFrac[0] * ref.height;
      const bottomY = LOOK_AT_Y + ref.height / 2 - layer.yFrac[1] * ref.height;
      const centerY = (topY + bottomY) / 2;

      layer.mesh.scale.set(ref.width * k, (topY - bottomY) * k, 1);
      layer.mesh.position.set(0, LOOK_AT_Y + (centerY - LOOK_AT_Y) * k, layer.z);
    };

    (async () => {
      try {
        const img = await loadImage("/calm-background.jpg");
        if (cancelled) return;
        imageAspect = img.width / img.height;

        LAYER_DEFS.forEach((def, i) => {
          const { canvas } = buildLayerCanvas(img, def);
          const texture = new THREE.CanvasTexture(canvas);
          texture.colorSpace = THREE.SRGBColorSpace;
          // Every strip blends rather than occludes, so a nearer plane's
          // faded edge never clips the scene behind it. Render order runs
          // far to near so the alpha compositing stacks correctly.
          const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            depthWrite: false,
            depthTest: false,
          });
          const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
          // 0 sky, 10 mid, 20 water. Stars sit at 5 (over the sky, behind
          // the tree) and fireflies at 30 (in front of everything).
          mesh.renderOrder = i * 10;
          scene.add(mesh);

          const layer = { ...def, mesh, texture, canvas };
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

      const idleX = Math.sin(t * 0.08) * 0.18;
      const idleY = Math.sin(t * 0.12) * 0.07;

      camera.position.x = currentPointer.x * 1.1 + idleX;
      camera.position.y = LOOK_AT_Y - currentPointer.y * 0.55 + idleY;
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
