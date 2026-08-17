"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Heart, Circle, Pause, Play } from "lucide-react";

interface SunflowerSpinnerProps {
  className?: string;
  /** Altura del canvas. Por defecto 420px. */
  height?: number | string;
  /** Muestra los botones de control. */
  controls?: boolean;
  /** Empieza con el centro en forma de corazón. */
  heartByDefault?: boolean;
}

/**
 * Girasol 3D interactivo, portado fielmente del prototipo Three.js.
 * - Arrastra (mouse o dedo) para rotarlo.
 * - Auto-rotación pausable.
 * - Centro conmutable: semillas redondas o corazón.
 * Elemento decorativo de marca para rellenar espacios vacíos.
 */
export const SunflowerSpinner: React.FC<SunflowerSpinnerProps> = ({
  className = "",
  height = 420,
  controls = true,
  heartByDefault = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<{
    setHeart: (v: boolean) => void;
    setRotate: (v: boolean) => void;
  } | null>(null);

  const [heart, setHeart] = useState(heartByDefault);
  const [autoRotate, setAutoRotate] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 8.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambient);
    const dir1 = new THREE.DirectionalLight(0xffffff, 0.9);
    dir1.position.set(4, 6, 8);
    scene.add(dir1);
    const dir2 = new THREE.DirectionalLight(0xfff2d0, 0.4);
    dir2.position.set(-5, -3, 4);
    scene.add(dir2);

    const flower = new THREE.Group();
    scene.add(flower);

    // Cuerpo verde detrás de los pétalos (como el girasol de referencia)
    const bodyGeo = new THREE.CircleGeometry(2.15, 56);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1f6b52, roughness: 0.85, metalness: 0.05, side: THREE.DoubleSide });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.z = -0.18;
    flower.add(body);

    const petalColors = [0xffb627, 0xff9e2c, 0xf5761f, 0xffc63a, 0xf2951f, 0xffce4a];

    function makePetalShape() {
      const s = new THREE.Shape();
      s.moveTo(0, 0);
      s.bezierCurveTo(-0.55, 0.55, -0.42, 1.55, 0, 2.15);
      s.bezierCurveTo(0.42, 1.55, 0.55, 0.55, 0, 0);
      return s;
    }

    const petalGeo = new THREE.ExtrudeGeometry(makePetalShape(), {
      depth: 0.06,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 2,
    });
    petalGeo.translate(0, 0, -0.03);

    const disposables: Array<{ dispose: () => void }> = [petalGeo, bodyGeo, bodyMat];

    // Textura de mosaico/vitral para el centro (mandala colorido)
    function makeMosaicTexture(): THREE.Texture {
      const S = 512;
      const cv = document.createElement("canvas");
      cv.width = cv.height = S;
      const g = cv.getContext("2d")!;
      g.fillStyle = "#0f3b46";
      g.fillRect(0, 0, S, S);
      const cx = S / 2, cy = S / 2, R = S / 2;
      const palette = ["#005DA4", "#00C0F3", "#8ED8F8", "#6B2D8B", "#E9C3E1", "#F37021", "#FDB912", "#6DC067", "#c05fd4", "#3a7bd5"];
      const rings = 9, spokes = 24;
      let seed = 7;
      const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
      for (let ri = 0; ri < rings; ri++) {
        const r0 = (ri / rings) * R, r1 = ((ri + 1) / rings) * R;
        const off = (ri % 2) * (Math.PI / spokes);
        for (let si = 0; si < spokes; si++) {
          const a0 = (si / spokes) * Math.PI * 2 + off;
          const a1 = ((si + 1) / spokes) * Math.PI * 2 + off;
          g.beginPath();
          g.arc(cx, cy, r1, a0, a1);
          g.arc(cx, cy, r0, a1, a0, true);
          g.closePath();
          g.fillStyle = palette[Math.floor(rnd() * palette.length)];
          g.globalAlpha = 0.75 + rnd() * 0.25;
          g.fill();
          g.globalAlpha = 1;
          g.lineWidth = 2.5;
          g.strokeStyle = "#0f3b46";
          g.stroke();
        }
      }
      // brillo central
      const grad = g.createRadialGradient(cx, cy, 0, cx, cy, R);
      grad.addColorStop(0, "rgba(255,255,255,0.55)");
      grad.addColorStop(0.3, "rgba(255,255,255,0.0)");
      g.fillStyle = grad;
      g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.fill();
      const tex = new THREE.CanvasTexture(cv);
      tex.anisotropy = 4;
      disposables.push(tex);
      return tex;
    }

    function buildPetalRing(
      count: number,
      baseRadius: number,
      scale: number,
      angleOffset: number,
      zOffset: number,
      tilt: number
    ) {
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + angleOffset;
        const mat = new THREE.MeshStandardMaterial({
          color: petalColors[i % petalColors.length],
          roughness: 0.55,
          metalness: 0.05,
          side: THREE.DoubleSide,
        });
        disposables.push(mat);
        const petal = new THREE.Mesh(petalGeo, mat);
        petal.scale.set(scale, scale, scale);
        petal.position.set(Math.cos(angle) * baseRadius, Math.sin(angle) * baseRadius, zOffset);
        petal.rotation.z = angle - Math.PI / 2;
        petal.rotation.x = tilt;
        flower.add(petal);
      }
    }

    buildPetalRing(13, 1.0, 1.15, 0, -0.02, 0.25);
    buildPetalRing(13, 0.65, 0.85, Math.PI / 13, 0.04, 0.12);

    function pointInPolygon(x: number, y: number, pts: { x: number; y: number }[]) {
      let inside = false;
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const xi = pts[i].x, yi = pts[i].y, xj = pts[j].x, yj = pts[j].y;
        const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
        if (intersect) inside = !inside;
      }
      return inside;
    }

    function scatterSeeds(boundaryPts: { x: number; y: number }[], radiusFit: number, count: number) {
      const group = new THREE.Group();
      const seedGeo = new THREE.SphereGeometry(0.045, 8, 8);
      disposables.push(seedGeo);
      const seedColors = [0x633806, 0x412402, 0x854f0b];
      let placed = 0, tries = 0;
      while (placed < count && tries < count * 40) {
        tries++;
        const gx = (Math.random() * 2 - 1) * radiusFit;
        const gy = (Math.random() * 2 - 1) * radiusFit;
        if (pointInPolygon(gx, gy, boundaryPts)) {
          const mat = new THREE.MeshStandardMaterial({
            color: seedColors[placed % seedColors.length],
            roughness: 0.6,
          });
          disposables.push(mat);
          const seed = new THREE.Mesh(seedGeo, mat);
          seed.position.set(gx, gy, 0.09);
          group.add(seed);
          placed++;
        }
      }
      return group;
    }

    function circlePoints(radius: number, segments: number) {
      const pts: { x: number; y: number }[] = [];
      for (let i = 0; i < segments; i++) {
        const a = (i / segments) * Math.PI * 2;
        pts.push({ x: Math.cos(a) * radius, y: Math.sin(a) * radius });
      }
      return pts;
    }

    const roundDiscGeo = new THREE.CircleGeometry(0.86, 64);
    const roundDiscMat = new THREE.MeshStandardMaterial({
      map: makeMosaicTexture(),
      color: 0xffffff,
      roughness: 0.35,
      metalness: 0.1,
      side: THREE.DoubleSide,
      emissive: 0x0a2530,
      emissiveIntensity: 0.4,
    });
    disposables.push(roundDiscGeo, roundDiscMat);
    const roundCenter = new THREE.Group();
    const roundDisc = new THREE.Mesh(roundDiscGeo, roundDiscMat);
    roundDisc.position.z = 0.04;
    roundCenter.add(roundDisc);
    // aro verde alrededor del mosaico
    const ringGeo = new THREE.RingGeometry(0.86, 0.98, 64);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0x1f6b52, roughness: 0.7, side: THREE.DoubleSide });
    disposables.push(ringGeo, ringMat);
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.z = 0.03;
    roundCenter.add(ring);
    flower.add(roundCenter);

    function makeHeartShape() {
      const x = 0, y = 0;
      const h = new THREE.Shape();
      h.moveTo(x + 0.25, y + 0.25);
      h.bezierCurveTo(x + 0.25, y + 0.25, x + 0.2, y, x, y);
      h.bezierCurveTo(x - 0.3, y, x - 0.3, y + 0.35, x - 0.3, y + 0.35);
      h.bezierCurveTo(x - 0.3, y + 0.55, x - 0.1, y + 0.77, x + 0.25, y + 0.95);
      h.bezierCurveTo(x + 0.6, y + 0.77, x + 0.8, y + 0.55, x + 0.8, y + 0.35);
      h.bezierCurveTo(x + 0.8, y + 0.35, x + 0.8, y, x + 0.5, y);
      h.bezierCurveTo(x + 0.35, y, x + 0.25, y + 0.25, x + 0.25, y + 0.25);
      return h;
    }

    const heartShapeObj = makeHeartShape();
    const heartGeo = new THREE.ExtrudeGeometry(heartShapeObj, {
      depth: 0.14,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 2,
    });
    heartGeo.rotateZ(Math.PI);
    heartGeo.center();
    heartGeo.scale(1.55, 1.55, 1);
    const heartMat = new THREE.MeshStandardMaterial({ color: 0x2c1608, roughness: 0.65, side: THREE.DoubleSide });
    disposables.push(heartGeo, heartMat);
    const heartCenter = new THREE.Group();
    const heartMesh = new THREE.Mesh(heartGeo, heartMat);
    heartMesh.position.z = 0.0;
    heartCenter.add(heartMesh);

    const heartBoundaryPts = heartShapeObj.getPoints(60).map((p) => {
      const cx = 0.25 * 1.55, cy = 0.4 * 1.55;
      return { x: (p.x * 1.55 - cx) * -1, y: (p.y * 1.55 - cy) * -1 };
    });
    heartCenter.add(scatterSeeds(heartBoundaryPts, 0.8, 140));
    heartCenter.visible = false;
    flower.add(heartCenter);

    // Estado inicial de centro
    heartCenter.visible = heartByDefault;
    roundCenter.visible = !heartByDefault;

    function onResize() {
      if (!container) return;
      const w = container.clientWidth, h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener("resize", onResize);

    let auto = true;
    let dragging = false;
    let lastX = 0, lastY = 0;

    function pointerDown(e: MouseEvent | TouchEvent) {
      dragging = true;
      container!.style.cursor = "grabbing";
      const p = "touches" in e ? e.touches[0] : e;
      lastX = p.clientX;
      lastY = p.clientY;
    }
    function pointerMove(e: MouseEvent | TouchEvent) {
      if (!dragging) return;
      const p = "touches" in e ? e.touches[0] : e;
      const dx = p.clientX - lastX;
      const dy = p.clientY - lastY;
      lastX = p.clientX;
      lastY = p.clientY;
      flower.rotation.y += dx * 0.01;
      flower.rotation.x += dy * 0.01;
      flower.rotation.x = Math.max(-0.6, Math.min(0.6, flower.rotation.x));
      if ("preventDefault" in e) e.preventDefault();
    }
    function pointerUp() {
      dragging = false;
      if (container) container.style.cursor = "grab";
    }

    container.addEventListener("mousedown", pointerDown);
    window.addEventListener("mousemove", pointerMove);
    window.addEventListener("mouseup", pointerUp);
    container.addEventListener("touchstart", pointerDown, { passive: true });
    container.addEventListener("touchmove", pointerMove, { passive: false });
    container.addEventListener("touchend", pointerUp);

    apiRef.current = {
      setHeart: (v: boolean) => {
        heartCenter.visible = v;
        roundCenter.visible = !v;
      },
      setRotate: (v: boolean) => {
        auto = v;
      },
    };

    let raf = 0;
    function animate() {
      raf = requestAnimationFrame(animate);
      if (auto && !dragging) flower.rotation.y += 0.006;
      renderer.render(scene, camera);
    }
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      container.removeEventListener("mousedown", pointerDown);
      window.removeEventListener("mousemove", pointerMove);
      window.removeEventListener("mouseup", pointerUp);
      container.removeEventListener("touchstart", pointerDown);
      container.removeEventListener("touchmove", pointerMove);
      container.removeEventListener("touchend", pointerUp);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heartByDefault]);

  const toggleHeart = () => {
    const v = !heart;
    setHeart(v);
    apiRef.current?.setHeart(v);
  };
  const toggleRotate = () => {
    const v = !autoRotate;
    setAutoRotate(v);
    apiRef.current?.setRotate(v);
  };

  return (
    <div className={`w-full ${className}`}>
      {controls && (
        <div className="mb-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={toggleHeart}
            className="inline-flex items-center gap-1.5 rounded-full border fu-border fu-surface-2 fu-text-2 px-3 py-1.5 text-xs font-semibold transition-colors hover:text-fu-orange"
          >
            {heart ? <Circle className="h-3.5 w-3.5" /> : <Heart className="h-3.5 w-3.5" />}
            {heart ? "Centro redondo" : "Centro corazón"}
          </button>
          <button
            type="button"
            onClick={toggleRotate}
            className="inline-flex items-center gap-1.5 rounded-full border fu-border fu-surface-2 fu-text-2 px-3 py-1.5 text-xs font-semibold transition-colors hover:text-fu-blue-dark"
          >
            {autoRotate ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {autoRotate ? "Pausar rotación" : "Reanudar rotación"}
          </button>
        </div>
      )}
      <div
        ref={containerRef}
        className="w-full cursor-grab overflow-hidden rounded-2xl"
        style={{ height: typeof height === "number" ? `${height}px` : height }}
        role="img"
        aria-label="Modelo 3D interactivo de un girasol. Arrástralo para rotarlo."
      />
    </div>
  );
};

export default SunflowerSpinner;
