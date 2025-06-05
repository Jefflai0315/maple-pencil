import dynamic from 'next/dynamic';

const GameCanvas = dynamic(() => import('../components/GameCanvas'), {
  ssr: false,
});

export default function GamePage() {
  return (
    <main className="w-screen h-screen">
      <GameCanvas />
    </main>
  );
}
