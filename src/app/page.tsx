import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the ThreeCanvas component with no SSR
const ThreeCanvasWithNoSSR = dynamic(
  () => import('@/components/ThreeCanvas'),
  { ssr: false }
);

const GamePage = () => {
  return (
    <div>
      <h1>My 3D Game</h1>
      <ThreeCanvasWithNoSSR />
    </div>
  );
};

export default GamePage;