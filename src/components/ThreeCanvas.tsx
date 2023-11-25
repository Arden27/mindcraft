'use client'

// components/ThreeCanvas.tsx

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from '@three-ts/orbit-controls';

const ThreeCanvas = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const keyPressRef = useRef({ forward: false, backward: false, left: false, right: false });

  useEffect(() => {
    // Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    if (canvasRef.current) {
      canvasRef.current.appendChild(renderer.domElement);
    }

    // Adding a Plane (Ground)
    const planeGeometry = new THREE.PlaneGeometry(100, 100, 32, 32);
    const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x555555, side: THREE.DoubleSide });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    scene.add(plane);

    // Adding a Cube
    const cubeGeometry = new THREE.BoxGeometry();
    const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.set(0, 0.5, 0);
    scene.add(cube);

    // Adding a Sphere
    const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(2, 0.5, 0);
    scene.add(sphere);

    camera.position.z = 5;

    // Camera Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);

    // Key Down Event
    const onKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
          keyPressRef.current.forward = true;
          break;
        case 'KeyS':
          keyPressRef.current.backward = true;
          break;
        case 'KeyA':
          keyPressRef.current.left = true;
          break;
        case 'KeyD':
          keyPressRef.current.right = true;
          break;
        default:
          break;
      }
    };

    // Key Up Event
    const onKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
          keyPressRef.current.forward = false;
          break;
        case 'KeyS':
          keyPressRef.current.backward = false;
          break;
        case 'KeyA':
          keyPressRef.current.left = false;
          break;
        case 'KeyD':
          keyPressRef.current.right = false;
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    // Animation Loop
    const animate = () => {
      requestAnimationFrame(animate);
    
      // Update Controls
      controls.update();
    
      // Handle Key Presses to Move Camera
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
    
      // Update the target of the camera controls
      controls.target.copy(camera.position).add(camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(10));
    
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
    
      sphere.rotation.x += 0.01;
      sphere.rotation.y += 0.01;
    
      renderer.render(scene, camera);
    };

    // Start the Animation
    animate();

    // Handle Browser Resizing
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      if (canvasRef.current) {
        canvasRef.current.removeChild(renderer.domElement);
      }
    };
  }, []); // Empty dependency array to ensure useEffect runs only once

  return <div ref={canvasRef}></div>;
};

export default ThreeCanvas;
