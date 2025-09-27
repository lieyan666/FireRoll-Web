import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface EmojiRainProps {
  emojis: string[]
}

interface EmojiDrop {
  id: number
  emoji: string
  left: number
  duration: number
  delay: number
}

const EmojiRain: React.FC<EmojiRainProps> = ({ emojis }) => {
  const [drops, setDrops] = useState<EmojiDrop[]>([])

  useEffect(() => {
    const newDrops: EmojiDrop[] = []
    const count = 30

    for (let i = 0; i < count; i++) {
      newDrops.push({
        id: i,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        left: Math.random() * 100,
        duration: 3 + Math.random() * 2,
        delay: Math.random() * 2,
      })
    }

    setDrops(newDrops)
  }, [emojis])

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {drops.map((drop) => (
        <motion.div
          key={drop.id}
          className="absolute text-4xl"
          initial={{
            top: '-10%',
            left: `${drop.left}%`,
            rotate: 0,
          }}
          animate={{
            top: '110%',
            rotate: 360,
          }}
          transition={{
            duration: drop.duration,
            delay: drop.delay,
            ease: 'linear',
          }}
        >
          {drop.emoji}
        </motion.div>
      ))}
    </div>
  )
}

export default EmojiRain