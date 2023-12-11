"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";

let WORLD_SIZE = 10;

class World extends THREE.Scene {
  constructor() {
    super();
    const worldGeometry = new THREE.SphereGeometry(WORLD_SIZE, 64, 64); // large radius for the sphere
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
  const moveState = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
  }).current; // Use ref to ensure synchronous updates

  useEffect(() => {
    const world = new World();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    camera.position.set(0, WORLD_SIZE + 1, 0);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    canvasRef.current?.appendChild(renderer.domElement);

    const controls = new PointerLockControls(camera, document.body);
    canvasRef.current?.addEventListener("click", () => {
      controls.lock();
    });

    const onKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case "KeyW":
          moveState.forward = true;
          break;
        case "KeyS":
          moveState.backward = true;
          break;
        case "KeyA":
          moveState.left = true;
          break;
        case "KeyD":
          moveState.right = true;
          break;
        case "Space":
          moveState.up = true;
          break;
        case "ControlLeft": // Use "ControlLeft" for left control key
          moveState.down = true;
          break;
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case "KeyW":
          moveState.forward = false;
          break;
        case "KeyS":
          moveState.backward = false;
          break;
        case "KeyA":
          moveState.left = false;
          break;
        case "KeyD":
          moveState.right = false;
          break;
        case "Space":
          moveState.up = false;
          break;
        case "ControlLeft":
          moveState.down = false;
          break;
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);

    const animate = () => {
      requestAnimationFrame(animate);
    
      if (controls.isLocked) {
        const speed = 0.1; // Movement speed
        const verticalSpeed = 1.0; // Vertical movement speed; adjust as needed
        const forwardDirection = new THREE.Vector3();
        const rightDirection = new THREE.Vector3();
        const upDirection = camera.position.clone().normalize(); // Direction from the camera towards the center of the planet
    
        // Get the forward direction relative to the camera's current rotation
        camera.getWorldDirection(forwardDirection);
        forwardDirection.normalize();
        rightDirection.crossVectors(camera.up, forwardDirection).normalize();
    
        // Project the movement directions onto the tangent plane at the camera's position
        const tangentForward = forwardDirection.sub(upDirection.clone().multiplyScalar(forwardDirection.dot(upDirection)));
        const tangentRight = rightDirection.sub(upDirection.clone().multiplyScalar(rightDirection.dot(upDirection)));
    
        if (moveState.forward) {
          camera.position.addScaledVector(tangentForward, speed);
        }
        if (moveState.backward) {
          camera.position.addScaledVector(tangentForward, -speed);
        }
        if (moveState.left) {
          camera.position.addScaledVector(tangentRight, speed);
        }
        if (moveState.right) {
          camera.position.addScaledVector(tangentRight, -speed);
        }
    
        if (moveState.up) {
          camera.position.setLength(camera.position.length() + verticalSpeed);
        } else if (moveState.down) {
          camera.position.setLength(camera.position.length() - verticalSpeed);
        }
    
        // Prevent the camera from going below the surface
        if (camera.position.length() < WORLD_SIZE + 1) {
          camera.position.setLength(WORLD_SIZE + 1);
        }
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
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
      if (canvasRef.current) {
        canvasRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={canvasRef}></div>;
};

export default ThreeCanvas;
