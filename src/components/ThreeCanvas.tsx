"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import CameraControls from 'camera-controls';

let WORLD_SIZE = 10;

class World extends THREE.Scene {
  constructor() {
    super();
    const worldGeometry = new THREE.SphereGeometry(WORLD_SIZE, 64, 64);
    const worldMaterial = new THREE.MeshBasicMaterial({
      color: 0xaaaaaa,
      wireframe: true,
    });
    const worldSphere = new THREE.Mesh(worldGeometry, worldMaterial);
    this.add(worldSphere);
  }
}

const ThreeCanvas = () => {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const world = new World();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    camera.position.set(0, WORLD_SIZE + 10, 0);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    canvasRef.current?.appendChild(renderer.domElement);

    CameraControls.install({ THREE: THREE });
    const controls = new CameraControls(camera, renderer.domElement);

    canvasRef.current?.addEventListener('click', () => {
      canvasRef.current?.requestPointerLock();
    });

    const handleMouseMove = (event: any) => {
      const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
      const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
      const rotationSpeed = 0.005;
      controls.rotate(-movementX * rotationSpeed, -movementY * rotationSpeed, false);
    };

    const handlePointerLockChange = () => {
      if (document.pointerLockElement === canvasRef.current) {
        document.addEventListener('mousemove', handleMouseMove);
      } else {
        document.removeEventListener('mousemove', handleMouseMove);
      }
    };

    document.addEventListener('pointerlockchange', handlePointerLockChange);

    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);

      const delta = clock.getDelta();
      controls.update(delta);

      renderer.render(world, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      if (canvasRef.current) {
        canvasRef.current.removeChild(renderer.domElement);
      }
      controls.dispose();
    };
  }, []);

  return <div ref={canvasRef}></div>;
};

export default ThreeCanvas;
