import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the ThreeCanvas component with no SSR
const ThreeCanvasWithNoSSR = dynamic(
  () => import('@/components/ThreeCanvas'),
  { ssr: false }
);

const GamePage = () => {
  return (
    <ThreeCanvasWithNoSSR />
  );
};

export default GamePage;