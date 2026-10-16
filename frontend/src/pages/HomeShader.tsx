import { DotGrid, MeshGradient, Shader } from 'shaders/react';

export default function HomeShader({ reduceMotion }: { reduceMotion: boolean }) {
  return <Shader className="home-hero-shader" disableTelemetry colorSpace="srgb">
    <MeshGradient colorA="#090b12" colorB="#282c50" stops={[
      { color: '#080a10', position: 0 },
      { color: '#18233a', position: 0.28 },
      { color: '#39477f', position: 0.52 },
      { color: '#344b80', position: 0.76 },
      { color: '#090b12', position: 1 }
    ]} colorSpace="oklab" count={5} smoothness={1.45} variation={0.48} swirl={0.16} drift={0.32} speed={reduceMotion ? 0 : 1.5} seed={12} />
    <DotGrid color="#aab8ff" density={48} dotSize={0.14} offset={0.5} speed={reduceMotion ? 0 : 0.1} twinkle={reduceMotion ? 0 : 0.18} opacity={0.14} blendMode="screen" />
  </Shader>;
}
