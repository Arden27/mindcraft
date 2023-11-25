"use client";

// components/ThreeCanvas.tsx

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";

class World extends THREE.Scene {
  constructor() {
    super();
  }

  addBlock(blockType: number, x: number, y: number, z: number) {
    const cubeGeometry = new THREE.BoxGeometry();
    const cubeMaterial = new THREE.MeshBasicMaterial({ color: blockType });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(x + 0.5, y + 0.5, z + 0.5);
    this.add(cube);
  }
}

const ThreeCanvas = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const keyPressRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  useEffect(() => {
    // Scene Setup
    const world = new World();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    if (canvasRef.current) {
      canvasRef.current.appendChild(renderer.domElement);
    }

    for (let x = 0; x < 10; x++) {
      for (let z = 0; z < 10; z++) {
        world.addBlock(0x555555, x - 5, 0, z - 5); // Grey color
      }
    }

    world.addBlock(0x0000ff, 1, 1, 1);

    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

    // Create wireframe
    const wireframeGeometry = new THREE.WireframeGeometry(cubeGeometry);
    const wireframeMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
    const wireframe = new THREE.LineSegments(
      wireframeGeometry,
      wireframeMaterial,
    );

    // Add wireframe to the cube
    cube.add(wireframe);

    cube.position.set(3.5, 3.5, 3.5);

    world.add(cube)

    camera.position.z = 5;

    // Camera Controls
    const controls = new PointerLockControls(camera, document.body);

    // Event to lock pointer and enable controls
    const enableControls = () => {
      controls.lock();
    };

    canvasRef.current?.addEventListener("click", enableControls);

    // Key Down Event
    const onKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case "KeyW":
          keyPressRef.current.forward = true;
          break;
        case "KeyS":
          keyPressRef.current.backward = true;
          break;
        case "KeyA":
          keyPressRef.current.left = true;
          break;
        case "KeyD":
          keyPressRef.current.right = true;
          break;
        default:
          break;
      }
    };

    // Key Up Event
    const onKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case "KeyW":
          keyPressRef.current.forward = false;
          break;
        case "KeyS":
          keyPressRef.current.backward = false;
          break;
        case "KeyA":
          keyPressRef.current.left = false;
          break;
        case "KeyD":
          keyPressRef.current.right = false;
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);

    // Animation Loop
    const animate = () => {
      requestAnimationFrame(animate);

      if (controls.isLocked === true) {
        const speed = 0.05;
        if (keyPressRef.current.forward) {
          camera.translateZ(-speed);
        }
        if (keyPressRef.current.backward) {
          camera.translateZ(speed);
        }
        if (keyPressRef.current.left) {
          camera.translateX(-speed);
        }
        if (keyPressRef.current.right) {
          camera.translateX(speed);
        }
      }

      renderer.render(world, camera);
    };

    animate();

    // Handle Browser Resizing
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
      if (canvasRef.current) {
        canvasRef.current.removeEventListener("click", enableControls);
        canvasRef.current.removeChild(renderer.domElement);
      }
    };
  }, []); // Empty dependency array to ensure useEffect runs only once

  return (
    <div>
      <div ref={canvasRef}></div>
      {/* Cursor element styled with Tailwind CSS */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 transform bg-white"></div>
    </div>
  );
};

export default ThreeCanvas;
