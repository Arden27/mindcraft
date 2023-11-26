"use client";

import { useEffect, useRef, useState } from "react";
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
    // Adjust position based on whether the index is negative or positive
    cube.position.set(
      x < 0 ? x + 0.5 : x - 0.5,
      y < 0 ? y + 0.5 : y - 0.5,
      z < 0 ? z + 0.5 : z - 0.5,
    );
    this.add(cube);
  }
}

const ThreeCanvas = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [observerCoords, setObserverCoords] = useState({
    x: "0",
    y: "0",
    z: "0",
  });
  const [blockCoords, setBlockCoords] = useState({ x: "0", y: "0", z: "0" });
  const keyPressRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  useEffect(() => {
    const world = new World();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    camera.position.y = 1;

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    canvasRef.current?.appendChild(renderer.domElement);

    // Create world blocks
    for (let x = 0; x < 10; x++) {
      for (let z = 0; z < 10; z++) {
        world.addBlock(0x555555, x - 5, 0, z - 5);
      }
    }

    world.addBlock(0x0000ff, 1, 1, 1);

    const controls = new PointerLockControls(camera, document.body);
    canvasRef.current?.addEventListener("click", () => controls.lock());

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("mousemove", onMouseMove, false);

    document.addEventListener("keydown", (event) => {
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
      }
    });

    document.addEventListener("keyup", (event) => {
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
      }
    });

    let highlightedBlock: THREE.Mesh | null = null;
    const outlineMaterial = new THREE.LineBasicMaterial({ color: 0xffff00 });
    const outlineGeometry = new THREE.EdgesGeometry(
      new THREE.BoxGeometry(1.02, 1.02, 1.02),
    );

    const animate = () => {
      requestAnimationFrame(animate);

      // Raycasting to find pointed block
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(world.children, true);
      if (intersects.length > 0) {
        const intersectedObject = intersects[0].object as THREE.Mesh;

        if (highlightedBlock !== intersectedObject) {
          if (highlightedBlock) {
            // Remove the outline from the previously highlighted block
            const previousOutline = highlightedBlock.getObjectByName("outline");
            if (previousOutline) {
              highlightedBlock.remove(previousOutline);
            }
          }

          // Create an outline for the new intersected object
          const outline = new THREE.LineSegments(
            outlineGeometry,
            outlineMaterial,
          );
          outline.name = "outline";
          intersectedObject.add(outline);

          highlightedBlock = intersectedObject;
        }

        setBlockCoords({
          x: intersectedObject.position.x.toFixed(2),
          y: intersectedObject.position.y.toFixed(2),
          z: intersectedObject.position.z.toFixed(2),
        });
      } else if (highlightedBlock) {
        // Remove the outline if we're not pointing at anything
        const currentOutline = highlightedBlock.getObjectByName("outline");
        if (currentOutline) {
          highlightedBlock.remove(currentOutline);
        }
        highlightedBlock = null;
      }

      if (controls.isLocked) {
        const speed = 0.05;
        if (keyPressRef.current.forward) camera.translateZ(-speed);
        if (keyPressRef.current.backward) camera.translateZ(speed);
        if (keyPressRef.current.left) camera.translateX(-speed);
        if (keyPressRef.current.right) camera.translateX(speed);
      }

      // Update observer coordinates
      setObserverCoords({
        x: camera.position.x.toFixed(2),
        y: camera.position.y.toFixed(2),
        z: camera.position.z.toFixed(2),
      });

      renderer.render(world, camera);
    };

    animate();

    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    return () => {
      window.removeEventListener("mousemove", onMouseMove, false);
      window.removeEventListener("resize", () => {});
      document.removeEventListener("keydown", () => {});
      document.removeEventListener("keyup", () => {});
      if (canvasRef.current) {
        canvasRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div>
      <div ref={canvasRef}></div>
      <div className="absolute left-0 top-0 m-4 text-white">
        Observer: x: {observerCoords.x}, y: {observerCoords.y}, z:{" "}
        {observerCoords.z}
      </div>
      <div className="absolute right-0 top-0 m-4 text-white">
        Pointing at block: x: {blockCoords.x}, y: {blockCoords.y}, z:{" "}
        {blockCoords.z}
      </div>
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 transform bg-white"></div>
    </div>
  );
};

export default ThreeCanvas;
