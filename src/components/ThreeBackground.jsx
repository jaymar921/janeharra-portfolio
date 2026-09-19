import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Reflector } from "three/examples/jsm/objects/Reflector.js";

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

function buildGlowTexture() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  );
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.35, "rgba(230,235,255,0.55)");
  gradient.addColorStop(1, "rgba(230,235,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// A flat, hand-drawn tree-on-an-island silhouette, used as a 2D billboard
// inside the 3D scene so it still tilts and reflects like everything else.
function buildTreeIslandTexture() {
  const w = 640;
  const h = 560;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");

  const cx = w / 2;
  const baseY = h - 150;

  // island mound
  ctx.beginPath();
  ctx.ellipse(cx, baseY, 190, 46, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#05070d";
  ctx.fill();

  // trunk
  ctx.beginPath();
  ctx.moveTo(cx - 10, baseY - 10);
  ctx.quadraticCurveTo(cx - 22, baseY - 160, cx - 6, baseY - 260);
  ctx.lineTo(cx + 10, baseY - 258);
  ctx.quadraticCurveTo(cx + 16, baseY - 150, cx + 12, baseY - 10);
  ctx.closePath();
  ctx.fillStyle = "#04060a";
  ctx.fill();

  // canopy (irregular overlapping puffs for an organic silhouette)
  const puffs = [
    [cx, baseY - 300, 115],
    [cx + 80, baseY - 270, 70],
    [cx - 90, baseY - 275, 68],
    [cx + 25, baseY - 350, 62],
    [cx - 35, baseY - 345, 60],
    [cx, baseY - 250, 90],
  ];
  ctx.fillStyle = "#03060a";
  puffs.forEach(([px, py, r]) => {
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();
  });

  // soft moonlit rim light along the upper-right edge of the canopy
  ctx.save();
  ctx.globalCompositeOperation = "source-atop";
  const rim = ctx.createRadialGradient(cx + 150, baseY - 420, 20, cx + 60, baseY - 300, 260);
  rim.addColorStop(0, "rgba(180,195,255,0.55)");
  rim.addColorStop(0.4, "rgba(150,170,230,0.12)");
  rim.addColorStop(1, "rgba(150,170,230,0)");
  ctx.fillStyle = rim;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();

  // grass tufts at the base
  ctx.strokeStyle = "#05070d";
  ctx.lineWidth = 3;
  for (let i = 0; i < 10; i++) {
    const gx = cx - 150 + i * 32 + (Math.random() - 0.5) * 10;
    ctx.beginPath();
    ctx.moveTo(gx, baseY + 6);
    ctx.quadraticCurveTo(gx + 6, baseY - 14, gx + 14, baseY - 4);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return { texture: tex, aspect: w / h };
}

export default function ThreeBackground() {
  const mountRef = useRef(null);
  const [webglOk] = useState(supportsWebGL);

  useEffect(() => {
    if (!webglOk) return;
    const mount = mountRef.current;
    if (!mount) return;

    const isSmall = window.innerWidth < 640;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      55,
      mount.clientWidth / mount.clientHeight,
      0.1,
      200
    );
    const lookTarget = new THREE.Vector3(0, 2, 0);
    camera.position.set(0, 2.6, 14);
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

    /* ---------------- water (reflective) ---------------- */
    const waterGeometry = new THREE.PlaneGeometry(200, 200);
    const water = new Reflector(waterGeometry, {
      clipBias: 0.003,
      textureWidth: isSmall ? 512 : 1024,
      textureHeight: isSmall ? 512 : 1024,
      color: 0x0c1830,
    });
    water.rotation.x = -Math.PI / 2;
    water.position.y = 0;
    scene.add(water);

    const waterTint = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
      new THREE.MeshBasicMaterial({ color: 0x11224a, transparent: true, opacity: 0.35 })
    );
    waterTint.rotation.x = -Math.PI / 2;
    waterTint.position.y = 0.001;
    scene.add(waterTint);

    /* ---------------- flat 2D tree-on-island billboard ---------------- */
    const { texture: treeTexture, aspect: treeAspect } = buildTreeIslandTexture();
    const treeHeight = 4.4;
    const treeWidth = treeHeight * treeAspect;
    const treeGroup = new THREE.Group();
    treeGroup.position.set(0, treeHeight / 2 - 0.55, -0.5);
    scene.add(treeGroup);

    const treeBillboard = new THREE.Mesh(
      new THREE.PlaneGeometry(treeWidth, treeHeight),
      new THREE.MeshBasicMaterial({ map: treeTexture, transparent: true })
    );
    treeGroup.add(treeBillboard);

    /* ---------------- moon ---------------- */
    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(1.1, 24, 24),
      new THREE.MeshBasicMaterial({ color: 0xf2f4ff })
    );
    moon.position.set(3.4, 3.6, -10);
    scene.add(moon);

    const glowTexture = buildGlowTexture();
    const moonGlow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTexture,
        color: 0xbcd0ff,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    moonGlow.scale.set(7, 7, 1);
    moonGlow.position.copy(moon.position);
    scene.add(moonGlow);

    /* ---------------- stars (far layer) ---------------- */
    const starCount = isSmall ? 260 : 480;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const radius = 40 + Math.random() * 40;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * 0.55 * Math.PI * 0.9;
      starPositions[i * 3] = Math.cos(theta) * radius * Math.sin(phi + 0.2);
      starPositions[i * 3 + 1] = 4 + Math.random() * 26;
      starPositions[i * 3 + 2] = -Math.sin(theta) * radius * Math.sin(phi + 0.2) - 10;
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

    /* ---------------- fireflies (near layer, warm flicker) ---------------- */
    const fireflyCount = isSmall ? 22 : 40;
    const fireflyGeometry = new THREE.BufferGeometry();
    const fireflyPositions = new Float32Array(fireflyCount * 3);
    const fireflySeeds = new Float32Array(fireflyCount);
    for (let i = 0; i < fireflyCount; i++) {
      fireflyPositions[i * 3] = (Math.random() - 0.5) * 5.5;
      fireflyPositions[i * 3 + 1] = Math.random() * 2.2 + 0.15;
      fireflyPositions[i * 3 + 2] = Math.random() * 2.5 + 0.5;
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

    /* ---------------- drifting air particles (visible breeze) ---------------- */
    const dustCount = isSmall ? 36 : 70;
    const dustGeometry = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    const dustSeeds = new Float32Array(dustCount);
    for (let i = 0; i < dustCount; i++) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 10;
      dustPositions[i * 3 + 1] = Math.random() * 4 + 0.2;
      dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 6 + 1;
      dustSeeds[i] = Math.random() * Math.PI * 2;
    }
    dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
    const dustMaterial = new THREE.PointsMaterial({
      color: 0xcfe0ff,
      size: 0.045,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const dust = new THREE.Points(dustGeometry, dustMaterial);
    scene.add(dust);

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

      // breeze: gentle paper-like sway on the flat tree billboard
      treeGroup.rotation.z = Math.sin(t * 1.1) * 0.035 + Math.sin(t * 0.37) * 0.012;
      treeGroup.rotation.y = Math.sin(t * 0.5) * 0.02;

      // drifting dust / visible air
      const dustPos = dustGeometry.attributes.position.array;
      for (let i = 0; i < dustCount; i++) {
        const seed = dustSeeds[i];
        dustPos[i * 3] += Math.sin(t * 0.5 + seed) * 0.0025;
        dustPos[i * 3 + 1] += 0.0018;
        dustPos[i * 3 + 2] += Math.cos(t * 0.4 + seed) * 0.0015;
        if (dustPos[i * 3 + 1] > 4.4) dustPos[i * 3 + 1] = 0.1;
      }
      dustGeometry.attributes.position.needsUpdate = true;

      // fireflies: slow wander + individual flicker
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
      camera.position.y = 2.6 - currentPointer.y * 0.9 + idleY;
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
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("pointermove", handlePointerMove);
      mount.removeChild(renderer.domElement);
      waterGeometry.dispose();
      starGeometry.dispose();
      dustGeometry.dispose();
      fireflyGeometry.dispose();
      glowTexture.dispose();
      treeTexture.dispose();
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
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
