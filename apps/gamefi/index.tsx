import dynamic from 'next/dynamic'
const PhaserGame = dynamic(() => import('./app/components/PhaserGame'), {
    ssr: false
})

export default PhaserGame;