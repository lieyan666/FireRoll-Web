import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Confetti from 'react-confetti'
import { Play, Settings, Download, X, Volume2, VolumeX, Sparkles, Trophy, Maximize2, Minimize2 } from 'lucide-react'
import EmojiRain from './components/EmojiRain'
import SettingsPanel from './components/SettingsPanel'
import ParticipantManager from './components/ParticipantManager'
import { LotterySettings, Participant, Winner } from './types'
import { saveSettingsToStorage, loadSettingsFromStorage } from './utils/configManager'

const DEFAULT_SETTINGS: LotterySettings = {
  animationSpeed: 5,
  soundEnabled: true,
  emojiEnabled: true,
  confettiEnabled: true,
  backgroundMusic: null,
  winnerSound: null,
  emojiList: ['🎉', '🎊', '🌟', '✨', '🎆', '🎇', '💫', '⭐'],
  primaryColor: '#018eee',
  allowDuplicate: false,
  backgroundType: 'none',
  backgroundColor: '#000000',
  backgroundImage: null,
  backgroundVideo: null,
  backgroundBlur: 5,
  animationType: 'spin',
  fullscreenTitle: '🔥 FireRoll 幸运抽奖',
  fullscreenSubtitle: '让幸运降临在你身边',
}

// 动画配置
const getAnimationConfig = (type: string) => {
  switch (type) {
    case 'flip':
      return {
        animate: { rotateY: [0, 180, 360] },
        transition: { duration: 0.6, ease: 'easeInOut' }
      }
    case 'zoom':
      return {
        animate: { scale: [0.8, 1.2, 1] },
        transition: { duration: 0.4, ease: 'easeOut' }
      }
    case 'slide':
      return {
        animate: { x: [-100, 0] },
        transition: { duration: 0.3, ease: 'easeOut' }
      }
    case 'bounce':
      return {
        animate: { y: [-30, 0] },
        transition: { duration: 0.4, type: 'spring', bounce: 0.5 }
      }
    case 'fade':
      return {
        animate: { opacity: [0, 1] },
        transition: { duration: 0.3 }
      }
    case 'spin':
    default:
      return {
        animate: { rotate: [0, 360] },
        transition: { duration: 0.5, ease: 'easeOut' }
      }
  }
}

function App() {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [currentName, setCurrentName] = useState('')
  const [isRolling, setIsRolling] = useState(false)
  const [winner, setWinner] = useState<Winner | null>(null)
  const [winners, setWinners] = useState<Winner[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showEmojiRain, setShowEmojiRain] = useState(false)
  const [settings, setSettings] = useState<LotterySettings>(DEFAULT_SETTINGS)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showMenu, setShowMenu] = useState(true)

  const audioRef = useRef<HTMLAudioElement>(null)
  const winnerAudioRef = useRef<HTMLAudioElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const intervalRef = useRef<number | null>(null)
  const fullscreenRef = useRef<HTMLDivElement>(null)
  const winnerTimeoutRef = useRef<number | null>(null)
  const availableParticipantsRef = useRef<Participant[]>([])

  useEffect(() => {
    const savedSettings = loadSettingsFromStorage()
    if (savedSettings) {
      setSettings(savedSettings)
    }
  }, [])

  useEffect(() => {
    saveSettingsToStorage(settings)
  }, [settings])

  useEffect(() => {
    if (settings.backgroundMusic && audioRef.current) {
      audioRef.current.src = settings.backgroundMusic
      if (settings.soundEnabled) {
        audioRef.current.play().catch(console.error)
      }
    }
  }, [settings.backgroundMusic, settings.soundEnabled])

  useEffect(() => {
    if (settings.backgroundType === 'video' && settings.backgroundVideo && videoRef.current) {
      videoRef.current.src = settings.backgroundVideo
      videoRef.current.play().catch(console.error)
    }
  }, [settings.backgroundType, settings.backgroundVideo])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  useEffect(() => {
    let hideMenuTimeout: number

    const handleMouseMove = () => {
      if (isFullscreen) {
        setShowMenu(true)
        clearTimeout(hideMenuTimeout)
        hideMenuTimeout = window.setTimeout(() => setShowMenu(false), 3000)
      }
    }

    if (isFullscreen) {
      window.addEventListener('mousemove', handleMouseMove)
      hideMenuTimeout = window.setTimeout(() => setShowMenu(false), 3000)
    } else {
      setShowMenu(true)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      clearTimeout(hideMenuTimeout)
    }
  }, [isFullscreen])

  const toggleFullscreen = async () => {
    if (!fullscreenRef.current) return

    if (!isFullscreen) {
      try {
        await fullscreenRef.current.requestFullscreen()
      } catch (error) {
        console.error('Error entering fullscreen:', error)
      }
    } else {
      try {
        await document.exitFullscreen()
      } catch (error) {
        console.error('Error exiting fullscreen:', error)
      }
    }
  }

  const startLottery = () => {
    if (participants.length === 0) {
      alert('请先上传参与者名单！')
      return
    }

    const availableParticipants = settings.allowDuplicate
      ? participants
      : participants.filter(p => !winners.some(w => w.id === p.id))

    if (availableParticipants.length === 0) {
      alert('所有参与者都已中奖！')
      return
    }

    // Save available participants for stop function
    availableParticipantsRef.current = availableParticipants

    // Clear previous winner state
    if (winnerTimeoutRef.current) {
      clearTimeout(winnerTimeoutRef.current)
    }

    setIsRolling(true)
    setWinner(null)
    setShowConfetti(false)
    setShowEmojiRain(false)

    // Speed range: 1-10, where 10 is fastest
    const speed = 120 - settings.animationSpeed * 10

    intervalRef.current = window.setInterval(() => {
      const randomIndex = Math.floor(Math.random() * availableParticipants.length)
      setCurrentName(availableParticipants[randomIndex].name)
    }, speed)
  }

  const stopLottery = () => {
    if (!intervalRef.current || !isRolling) return

    clearInterval(intervalRef.current)
    intervalRef.current = null

    const availableParticipants = availableParticipantsRef.current
    if (availableParticipants.length === 0) return

    // Select final winner
    const winnerIndex = Math.floor(Math.random() * availableParticipants.length)
    const selectedWinner = availableParticipants[winnerIndex]
    const newWinner: Winner = {
      ...selectedWinner,
      timestamp: Date.now(),
    }

    setCurrentName(selectedWinner.name)
    setIsRolling(false)
    setWinner(newWinner)
    setWinners(prev => [...prev, newWinner])

    // Show effects
    if (settings.confettiEnabled) setShowConfetti(true)
    if (settings.emojiEnabled) setShowEmojiRain(true)

    if (settings.winnerSound && winnerAudioRef.current && settings.soundEnabled) {
      winnerAudioRef.current.src = settings.winnerSound
      winnerAudioRef.current.play().catch(console.error)
    }

    // Auto clear effects after 8 seconds
    winnerTimeoutRef.current = window.setTimeout(() => {
      setShowConfetti(false)
      setShowEmojiRain(false)
      setWinner(null)
      setCurrentName('')
    }, 8000)
  }

  const exportResults = () => {
    if (winners.length === 0) {
      alert('暂无中奖结果！')
      return
    }

    const csvContent = 'data:text/csv;charset=utf-8,姓名,中奖时间\n' +
      winners.map(w => `${w.name},${new Date(w.timestamp).toLocaleString()}`).join('\n')

    const link = document.createElement('a')
    link.setAttribute('href', encodeURI(csvContent))
    link.setAttribute('download', `lottery_results_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const resetLottery = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (winnerTimeoutRef.current) {
      clearTimeout(winnerTimeoutRef.current)
    }
    setWinners([])
    setWinner(null)
    setCurrentName('')
    setIsRolling(false)
    setShowConfetti(false)
    setShowEmojiRain(false)
  }

  const getBackgroundStyle = (): React.CSSProperties => {
    switch (settings.backgroundType) {
      case 'color':
        return { backgroundColor: settings.backgroundColor }
      case 'image':
        return settings.backgroundImage
          ? {
              backgroundImage: `url(${settings.backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }
          : {}
      default:
        return {}
    }
  }

  // 简化的抽奖显示组件
  const LotteryDisplay = ({ size = 'normal' }: { size?: 'normal' | 'large' }) => {
    const isLarge = size === 'large'
    const animConfig = getAnimationConfig(settings.animationType)

    if (!currentName && !winner) {
      return (
        <div className={isLarge ? "text-gray-500 text-4xl" : "text-gray-500 text-2xl"}>
          点击开始抽奖
        </div>
      )
    }

    return (
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentName || 'empty'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, ...animConfig.animate }}
            exit={{ opacity: 0 }}
            transition={animConfig.transition}
            className="text-center"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className={`font-bold ${isLarge ? 'text-7xl' : 'text-5xl'} ${winner ? 'text-primary' : 'text-white'}`}>
              {currentName}
            </div>
            {winner && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`mt-4 text-primary-light ${isLarge ? 'text-3xl' : 'text-xl'}`}
              >
                恭喜中奖！
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div ref={fullscreenRef} className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden relative" style={getBackgroundStyle()}>
      {settings.backgroundType === 'video' && settings.backgroundVideo && (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: `blur(${settings.backgroundBlur}px)` }}
          loop
          muted
          autoPlay
        />
      )}

      {(settings.backgroundType === 'image' || settings.backgroundType === 'video') && (
        <div
          className="absolute inset-0 bg-black/50"
          style={{ backdropFilter: `blur(${settings.backgroundBlur}px)` }}
        />
      )}

      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={300}
        />
      )}

      {showEmojiRain && settings.emojiEnabled && (
        <EmojiRain emojis={settings.emojiList} />
      )}

      <audio ref={audioRef} loop />
      <audio ref={winnerAudioRef} />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <AnimatePresence>
          {showMenu && (
            <motion.header
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              className="text-center mb-8"
            >
              <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                {settings.fullscreenTitle}
              </h1>
              <p className="text-xl text-gray-400">{settings.fullscreenSubtitle}</p>
            </motion.header>
          )}
        </AnimatePresence>

        <div className="max-w-6xl mx-auto">
          {isFullscreen ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center justify-center min-h-[80vh]"
            >
              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-4 right-4 flex gap-2"
                  >
                    <button
                      onClick={toggleFullscreen}
                      className="p-3 rounded-lg bg-gray-700/80 hover:bg-gray-600/80 backdrop-blur transition-colors"
                    >
                      <Minimize2 size={24} />
                    </button>
                    <button
                      onClick={() => setShowSettings(!showSettings)}
                      className="p-3 rounded-lg bg-gray-700/80 hover:bg-gray-600/80 backdrop-blur transition-colors"
                    >
                      <Settings size={24} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div
                className="relative w-full max-w-4xl h-96 bg-gray-900/50 backdrop-blur rounded-3xl flex items-center justify-center mb-8 overflow-hidden"
                style={{
                  boxShadow: winner ? `0 0 60px ${settings.primaryColor}60` : 'none',
                  perspective: '1000px'
                }}
              >
                <LotteryDisplay size="large" />
              </div>

              <div className="flex gap-4">
                {!isRolling ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startLottery}
                    className="px-12 py-6 bg-primary hover:bg-primary-dark rounded-2xl font-bold text-3xl flex items-center gap-3 shadow-lg glow-effect"
                  >
                    <Play size={32} />
                    开始抽奖
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={stopLottery}
                    className="px-12 py-6 bg-red-500 hover:bg-red-600 rounded-2xl font-bold text-3xl flex items-center gap-3 shadow-lg"
                  >
                    <X size={32} />
                    停止
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetLottery}
                  className="px-12 py-6 bg-gray-600 hover:bg-gray-700 rounded-2xl font-bold text-3xl shadow-lg"
                >
                  重置
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-gray-800/50 backdrop-blur-lg rounded-3xl p-8 shadow-2xl"
                  style={{ borderColor: settings.primaryColor, borderWidth: 2 }}
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Trophy className="text-primary" />
                      抽奖区域
                    </h2>
                    <div className="flex gap-2">
                      <button
                        onClick={toggleFullscreen}
                        className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                        title="全屏"
                      >
                        <Maximize2 size={24} />
                      </button>
                      <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                        title="设置"
                      >
                        <Settings size={24} />
                      </button>
                    </div>
                  </div>

                  <div
                    className="relative h-64 bg-gray-900/50 rounded-2xl flex items-center justify-center mb-8 overflow-hidden"
                    style={{
                      boxShadow: winner ? `0 0 40px ${settings.primaryColor}40` : 'none',
                      perspective: '1000px'
                    }}
                  >
                    <LotteryDisplay size="normal" />
                  </div>

                  <div className="flex gap-4 justify-center">
                    {!isRolling ? (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={startLottery}
                        className="px-8 py-4 bg-primary hover:bg-primary-dark rounded-xl font-bold text-xl flex items-center gap-2 shadow-lg glow-effect"
                      >
                        <Play size={24} />
                        开始抽奖
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={stopLottery}
                        className="px-8 py-4 bg-red-500 hover:bg-red-600 rounded-xl font-bold text-xl flex items-center gap-2 shadow-lg"
                      >
                        <X size={24} />
                        停止
                      </motion.button>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={resetLottery}
                      className="px-8 py-4 bg-gray-600 hover:bg-gray-700 rounded-xl font-bold text-xl shadow-lg"
                    >
                      重置
                    </motion.button>
                  </div>

                  {settings.allowDuplicate && (
                    <div className="mt-4 text-center text-sm text-gray-400">
                      <span className="inline-flex items-center gap-1">
                        <Sparkles size={16} />
                        允许重复中奖模式已开启
                      </span>
                    </div>
                  )}
                </motion.div>

                {winners.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 bg-gray-800/50 backdrop-blur-lg rounded-3xl p-6 shadow-2xl"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        <Trophy className="text-primary" />
                        中奖名单 ({winners.length})
                      </h3>
                      <button
                        onClick={exportResults}
                        className="px-4 py-2 bg-primary hover:bg-primary-dark rounded-lg flex items-center gap-2"
                      >
                        <Download size={18} />
                        导出结果
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {winners.map((w, index) => (
                        <motion.div
                          key={`${w.id}-${index}`}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-gray-700/50 rounded-lg p-3"
                        >
                          <div className="font-semibold">{w.name}</div>
                          <div className="text-xs text-gray-400">
                            {new Date(w.timestamp).toLocaleTimeString()}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="space-y-6">
                <motion.div
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                >
                  <ParticipantManager
                    participants={participants}
                    onParticipantsChange={setParticipants}
                    winners={winners}
                  />
                </motion.div>

                <motion.div
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gray-800/50 backdrop-blur-lg rounded-3xl p-6 shadow-2xl"
                >
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Sparkles className="text-primary" />
                    快速操作
                  </h3>

                  <div className="space-y-3">
                    <button
                      onClick={() => setSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
                      className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center gap-2"
                    >
                      {settings.soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                      音效: {settings.soundEnabled ? '开启' : '关闭'}
                    </button>

                    <button
                      onClick={() => setSettings({ ...settings, emojiEnabled: !settings.emojiEnabled })}
                      className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center gap-2"
                    >
                      <Sparkles size={20} />
                      特效: {settings.emojiEnabled ? '开启' : '关闭'}
                    </button>

                    <button
                      onClick={() => setSettings({ ...settings, allowDuplicate: !settings.allowDuplicate })}
                      className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center gap-2"
                    >
                      <Trophy size={20} />
                      重复中奖: {settings.allowDuplicate ? '允许' : '不允许'}
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showSettings && (
          <SettingsPanel
            settings={settings}
            onSettingsChange={setSettings}
            onClose={() => setShowSettings(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default App