"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
//import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";
import { CustomPointerLockControls } from "@/components/CustomPointerLockControls";

let WORLD_SIZE = 10;

class World extends THREE.Scene {
  constructor() {
    super();
    this.createMainSphere();
    this.createEquatorLine();
    this.createSmallSphere();
    this.createAnotherSphere();
    this.createOneMoreSphere();
    this.createWhiteSphere();
  }

  createMainSphere() {
    const geometry = new THREE.SphereGeometry(WORLD_SIZE, 16, 16);
    const material = new THREE.MeshBasicMaterial({ color: 0xaaaaaa, wireframe: true });
    const sphere = new THREE.Mesh(geometry, material);
    this.add(sphere);
  }

  createEquatorLine() {
    const equatorGeometry = new THREE.CircleGeometry(WORLD_SIZE, 64);
    equatorGeometry.rotateX(Math.PI / 2); // Orient it to lie in the XY plane
    const equatorMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
    const equatorLine = new THREE.LineLoop(equatorGeometry, equatorMaterial);
    this.add(equatorLine);
  }

  createSmallSphere() {
    const smallSphereGeometry = new THREE.SphereGeometry(1, 8, 8);
    const smallSphereMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
    const smallSphere = new THREE.Mesh(smallSphereGeometry, smallSphereMaterial);
    smallSphere.position.set(0, 10, -20); // Position outside the main sphere
    this.add(smallSphere);
  }

  createAnotherSphere() {
    const smallSphereGeometry = new THREE.SphereGeometry(1, 8, 8);
    const smallSphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
    const smallSphere = new THREE.Mesh(smallSphereGeometry, smallSphereMaterial);
    smallSphere.position.set(0, 0, -20); // Position outside the main sphere
    this.add(smallSphere);
  }

  createOneMoreSphere() {
    const smallSphereGeometry = new THREE.SphereGeometry(1, 8, 8);
    const smallSphereMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: true });
    const smallSphere = new THREE.Mesh(smallSphereGeometry, smallSphereMaterial);
    smallSphere.position.set(0, -10, -20); // Position outside the main sphere
    this.add(smallSphere);
  }

  createWhiteSphere() {
    const smallSphereGeometry = new THREE.SphereGeometry(1, 8, 8);
    const smallSphereMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa, wireframe: true });
    const smallSphere = new THREE.Mesh(smallSphereGeometry, smallSphereMaterial);
    smallSphere.position.set(0, -20, -20); // Position outside the main sphere
    this.add(smallSphere);
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

  const cameraPositionRef = useRef({ x: 0, y: 0, z: 0 });

  const [cameraPosition, setCameraPosition] = useState({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    let lastUpdateTime = Date.now();
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

    const controls = new CustomPointerLockControls(camera, document.body);
    // controls.minPolarAngle = 0; // Minimum vertical rotation (0 = directly downwards)
    // controls.maxPolarAngle = Math.PI; // Maximum vertical rotation (Math.PI = directly upwards)

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

        // Update camera position reference
        cameraPositionRef.current = {
          x: camera.position.x,
          y: camera.position.y,
          z: camera.position.z,
        };

        // Project the movement directions onto the tangent plane at the camera's position
        const tangentForward = forwardDirection.sub(
          upDirection.clone().multiplyScalar(forwardDirection.dot(upDirection)),
        );
        const tangentRight = rightDirection.sub(
          upDirection.clone().multiplyScalar(rightDirection.dot(upDirection)),
        );

        if (moveState.forward) {
          camera.position.addScaledVector(tangentForward, speed);
        }
        if (moveState.backward) {
          camera.position.addScaledVector(tangentForward, -speed);
        }
        const isBelowEquator = cameraPositionRef.current.y < 0;
        const lateralMovementFactor = isBelowEquator ? -1 : 1;

        if (moveState.left) {
          camera.position.addScaledVector(
            tangentRight,
            lateralMovementFactor * speed,
          );
        }
        if (moveState.right) {
          camera.position.addScaledVector(
            tangentRight,
            lateralMovementFactor * -speed,
          );
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

      // Throttle state updates
      if (Date.now() - lastUpdateTime > 200) { // Update every 200 ms
        setCameraPosition({
          x: camera.position.x,
          y: camera.position.y,
          z: camera.position.z,
        });
        lastUpdateTime = Date.now();
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

  return (
    <>
      <div className="absolute left-0 top-0 text-white">
        {`Camera Position: x=${cameraPosition.x.toFixed(
          2,
        )}, y=${cameraPosition.y.toFixed(2)}, z=${cameraPosition.z.toFixed(2)}`}
      </div>
      <div ref={canvasRef}></div>
    </>
  );
};

export default ThreeCanvas;
