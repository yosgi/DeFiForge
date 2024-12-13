"use client";
import * as THREE from 'three'
import React, { useRef, useState } from 'react'
import { Canvas, useFrame, ThreeElements,useLoader } from '@react-three/fiber'
import { Points, PointMaterial,Point } from '@react-three/drei';
import { TextureLoader } from 'three';
import { MathUtils,Vector3 } from 'three'

const positions = Array.from({ length: 80 }, (i) => [
  MathUtils.randFloatSpread(8),
  MathUtils.randFloatSpread(8),
  MathUtils.randFloatSpread(8),
])

interface PointEventProps {
  position: Vector3,
  index?: number
  color: string
  // size: number
  // onClick: () => void
  // onHover: () => void
}

function PointEvent(props: PointEventProps) {
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)
  return (
    <Point
      {...props}
    // color={clicked ? 'lightblue' : hovered ? 'hotpink' : 'orange'}
    // onPointerOver={(e) => (e.stopPropagation(), setHover(true))}
    // onPointerOut={(e) => setHover(false)}
    // onClick={(e) => (e.stopPropagation(), setClick((state) => !state))}
    ></Point>
)

}

function PointCloud() {
  const texture = useLoader(TextureLoader, '/textures/point.png'); // 自定义点材质
  return (
    <Points>
         <PointMaterial
          transparent
          vertexColors
          size={20}
          sizeAttenuation={false}
          depthTest={false}
          toneMapped={false}
        />
        {positions.map((position, i) => (
          <PointEvent color="red" index={i} position={position as any} />
        ))}
      {/* <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={10000} // 点的数量
          itemSize={3} // 每个点由3个值（x, y, z）组成
          array={Float32Array.from({ length: 30000 }, () => Math.random() * 10 - 5)}
        />
      </bufferGeometry>
      <PointMaterial
        size={0.1} // 点的大小
        // map={texture} // 自定义点的贴图
        color="green"
        transparent
        depthWrite={false}
        opacity={0.8}
      /> */}
    </Points>
  );
}


function Box(props: ThreeElements['mesh']) {
  const ref = useRef<THREE.Mesh>(null!)
  const [hovered, hover] = useState(false)
  const [clicked, click] = useState(false)
  useFrame((state, delta) => (ref.current.rotation.x += delta))
  return (

    <mesh
      {...props}
      ref={ref}
      scale={clicked ? 1.5 : 1}
      onClick={(event) => click(!clicked)}
      onPointerOver={(event) => hover(true)}
      onPointerOut={(event) => hover(false)}>
      <boxGeometry args={[1, 1, 1]} />
     
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  )
}


const HomePage = () => {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight />
        <ambientLight intensity={Math.PI / 2} />
        {/* <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
        <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} /> */}
        <PointCloud />
        {/* <Box position={[-1.2, 0, 0]} />
        <Box position={[1.2, 0, 0]} /> */}
      </Canvas>
    </div>
  );
}

export default HomePage;
