"use client"

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";

let WORLD_SIZE = 50

class World extends THREE.Scene {
  constructor() {
    super();
    const worldGeometry = new THREE.SphereGeometry(WORLD_SIZE, 64, 64); // large radius for the sphere
    const worldMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa, wireframe: true });
    const worldSphere = new THREE.Mesh(worldGeometry, worldMaterial);
    this.add(worldSphere);
  }
}

const ThreeCanvas = () => {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const world = new World();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, WORLD_SIZE + 1, 0); // Position camera slightly above the sphere

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    canvasRef.current?.appendChild(renderer.domElement);

    const controls = new PointerLockControls(camera, document.body);
    canvasRef.current?.addEventListener("click", () => controls.lock());

    const animate = () => {
      requestAnimationFrame(animate);

      if (controls.isLocked) {
        const speed = 0.05;
        // Basic movement - this will need to be adjusted for spherical movement
        const direction = new THREE.Vector3();
        controls.getDirection(direction);
        direction.y = 0; // Keep the movement horizontal
        direction.normalize(); // Normalize to keep consistent speed
        direction.multiplyScalar(speed);

        camera.position.add(direction); // Move the camera

        // Adjust camera's 'up' to align with sphere's normal
        const playerPosition = new THREE.Vector3().copy(camera.position).normalize();
        const upDirection = playerPosition.clone().negate();
        camera.up.copy(upDirection);
        // camera.lookAt(camera.position.clone().add(playerPosition)); // Adjust camera's lookAt
      }

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
      if (canvasRef.current) {
        canvasRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={canvasRef}></div>;
};

export default ThreeCanvas;
