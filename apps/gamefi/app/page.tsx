"use client";
import React, { useRef, useState } from 'react'
import dynamic from 'next/dynamic'

const PhaserGame = dynamic(() => import('./components/PhaserGame'), {
  ssr: false
})

const HomePage = () => {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <PhaserGame />
    </div>  
  );
}

export default HomePage;
