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
      42,
      mount.clientWidth / mount.clientHeight,
      0.1,
      200
    );
    camera.position.set(0, 2.6, 15);
    camera.lookAt(0, 2, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "low-power",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isSmall ? 1.5 : 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    /* ---------------- lighting ---------------- */
    const moonLight = new THREE.DirectionalLight(0xaebfff, 1.1);
    moonLight.position.set(4, 6, -2);
    scene.add(moonLight);
    scene.add(new THREE.AmbientLight(0x39406b, 0.9));

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

    // subtle tint layer above the reflector so it reads as dark tropical water
    const waterTint = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
      new THREE.MeshBasicMaterial({
        color: 0x11224a,
        transparent: true,
        opacity: 0.35,
      })
    );
    waterTint.rotation.x = -Math.PI / 2;
    waterTint.position.y = 0.001;
    scene.add(waterTint);

    /* ---------------- island ---------------- */
    const island = new THREE.Group();
    const islandMound = new THREE.Mesh(
      new THREE.ConeGeometry(1.7, 0.9, 7, 1),
      new THREE.MeshStandardMaterial({ color: 0x05070d, roughness: 1 })
    );
    islandMound.position.y = 0.35;
    islandMound.rotation.y = 0.4;
    island.add(islandMound);
    scene.add(island);

    /* ---------------- tree (swaying in the breeze) ---------------- */
    const tree = new THREE.Group();
    tree.position.y = 0.75;
    island.add(tree);

    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.16, 1.9, 6),
      new THREE.MeshStandardMaterial({ color: 0x04060a, roughness: 1 })
    );
    trunk.position.y = 0.95;
    trunk.rotation.z = 0.06;
    tree.add(trunk);

    const foliageGroup = new THREE.Group();
    foliageGroup.position.y = 1.9;
    tree.add(foliageGroup);

    const foliageMaterial = new THREE.MeshStandardMaterial({
      color: 0x030603,
      roughness: 1,
      flatShading: true,
    });
    const foliagePuffs = [
      [0, 0, 0, 1.05],
      [0.65, 0.12, 0.1, 0.62],
      [-0.7, 0.08, -0.15, 0.6],
      [0.15, 0.3, 0.55, 0.55],
      [-0.2, 0.25, -0.55, 0.58],
      [0.05, -0.15, 0, 0.8],
    ];
    foliagePuffs.forEach(([x, y, z, s]) => {
      const puff = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 0), foliageMaterial);
      puff.position.set(x, y, z);
      foliageGroup.add(puff);
    });

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

    /* ---------------- stars ---------------- */
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

    /* ---------------- drifting air particles (visible breeze) ---------------- */
    const dustCount = isSmall ? 40 : 80;
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
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const dust = new THREE.Points(dustGeometry, dustMaterial);
    scene.add(dust);

    /* ---------------- animation loop ---------------- */
    const clock = new THREE.Clock();
    let frameId;

    const animate = () => {
      const t = clock.getElapsedTime();

      // breeze: gentle sway on the foliage + a softer sway on the whole tree
      foliageGroup.rotation.z = Math.sin(t * 1.1) * 0.06 + Math.sin(t * 0.37) * 0.02;
      foliageGroup.rotation.x = Math.cos(t * 0.8) * 0.03;
      tree.rotation.z = Math.sin(t * 0.6) * 0.015;

      // drifting dust / visible air
      const positions = dustGeometry.attributes.position.array;
      for (let i = 0; i < dustCount; i++) {
        const seed = dustSeeds[i];
        positions[i * 3] += Math.sin(t * 0.5 + seed) * 0.0025;
        positions[i * 3 + 1] += 0.0018;
        positions[i * 3 + 2] += Math.cos(t * 0.4 + seed) * 0.0015;
        if (positions[i * 3 + 1] > 4.4) positions[i * 3 + 1] = 0.1;
      }
      dustGeometry.attributes.position.needsUpdate = true;

      // twinkle
      starMaterial.opacity = 0.7 + Math.sin(t * 0.8) * 0.12;

      // slow living camera drift
      camera.position.x = Math.sin(t * 0.06) * 0.6;
      camera.position.y = 2.6 + Math.sin(t * 0.15) * 0.08;
      camera.lookAt(0, 2, 0);

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
      mount.removeChild(renderer.domElement);
      waterGeometry.dispose();
      starGeometry.dispose();
      dustGeometry.dispose();
      glowTexture.dispose();
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
