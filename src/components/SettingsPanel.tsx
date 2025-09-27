import React, { useRef } from 'react'
import { motion } from 'framer-motion'
import { X, Sliders, Volume2, Sparkles, Palette, Music, Image, Film, RefreshCw, Zap, Type, FileDown, FileUp } from 'lucide-react'
import { LotterySettings } from '../types'
import { LOTTERY_ANIMATIONS } from '../utils/animations'
import { exportSettings, importSettings } from '../utils/configManager'

interface SettingsPanelProps {
  settings: LotterySettings
  onSettingsChange: (settings: LotterySettings) => void
  onClose: () => void
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onSettingsChange,
  onClose,
}) => {
  const bgMusicRef = useRef<HTMLInputElement>(null)
  const winnerSoundRef = useRef<HTMLInputElement>(null)
  const bgImageRef = useRef<HTMLInputElement>(null)
  const bgVideoRef = useRef<HTMLInputElement>(null)
  const configImportRef = useRef<HTMLInputElement>(null)

  const handleConfigExport = () => {
    const success = exportSettings(settings)
    if (success) {
      alert('配置已导出！')
    } else {
      alert('导出配置失败')
    }
  }

  const handleConfigImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const importedSettings = await importSettings(file)
    if (importedSettings) {
      onSettingsChange(importedSettings)
      alert('配置导入成功！')
    }
    // Reset input
    if (configImportRef.current) {
      configImportRef.current.value = ''
    }
  }

  const handleBgMusicUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      onSettingsChange({ ...settings, backgroundMusic: url })
    }
  }

  const handleWinnerSoundUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      onSettingsChange({ ...settings, winnerSound: url })
    }
  }

  const handleEmojiChange = (value: string) => {
    const emojis = value.split(',').map(e => e.trim()).filter(e => e)
    if (emojis.length > 0) {
      onSettingsChange({ ...settings, emojiList: emojis })
    }
  }

  const handleBgImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      onSettingsChange({ ...settings, backgroundImage: url, backgroundType: 'image' })
    }
  }

  const handleBgVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      onSettingsChange({ ...settings, backgroundVideo: url, backgroundType: 'video' })
    }
  }

  const presetColors = [
    '#018eee', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#ff7979', '#6c5ce7'
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-800 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sliders className="text-primary" />
            设置面板
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="flex items-center gap-2 mb-4">
              <Zap className="text-primary" size={20} />
              <span className="font-medium">动画效果</span>
            </label>

            <div className="grid grid-cols-3 gap-2">
              {LOTTERY_ANIMATIONS.map(anim => (
                <button
                  key={anim.type}
                  onClick={() => onSettingsChange({ ...settings, animationType: anim.type })}
                  className={`px-3 py-2 rounded-lg text-center ${
                    settings.animationType === anim.type ? 'bg-primary' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <div className="font-medium">{anim.name}</div>
                  <div className="text-xs opacity-75">{anim.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 mb-4">
              <RefreshCw className="text-primary" size={20} />
              <span className="font-medium">抽奖设置</span>
            </label>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.allowDuplicate}
                  onChange={(e) => onSettingsChange({
                    ...settings,
                    allowDuplicate: e.target.checked,
                  })}
                  className="w-5 h-5 text-primary"
                />
                <span>允许重复中奖</span>
              </label>

              <div>
                <label className="block text-sm mb-2">
                  动画速度
                </label>
            <input
              type="range"
              min="1"
              max="10"
              value={settings.animationSpeed}
              onChange={(e) => onSettingsChange({
                ...settings,
                animationSpeed: Number(e.target.value),
              })}
              className="w-full"
            />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>慢</span>
                  <span>{settings.animationSpeed}</span>
                  <span>快</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 mb-4">
              <Volume2 className="text-primary" size={20} />
              <span className="font-medium">音效设置</span>
            </label>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => onSettingsChange({
                    ...settings,
                    soundEnabled: e.target.checked,
                  })}
                  className="w-5 h-5 text-primary"
                />
                <span>启用音效</span>
              </label>

              <div>
                <input
                  type="file"
                  ref={bgMusicRef}
                  onChange={handleBgMusicUpload}
                  accept="audio/*"
                  className="hidden"
                />
                <button
                  onClick={() => bgMusicRef.current?.click()}
                  className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2"
                >
                  <Music size={18} />
                  上传背景音乐
                  {settings.backgroundMusic && <span className="text-primary ml-auto">✓</span>}
                </button>
              </div>

              <div>
                <input
                  type="file"
                  ref={winnerSoundRef}
                  onChange={handleWinnerSoundUpload}
                  accept="audio/*"
                  className="hidden"
                />
                <button
                  onClick={() => winnerSoundRef.current?.click()}
                  className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2"
                >
                  <Volume2 size={18} />
                  上传中奖音效
                  {settings.winnerSound && <span className="text-primary ml-auto">✓</span>}
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 mb-4">
              <Sparkles className="text-primary" size={20} />
              <span className="font-medium">特效设置</span>
            </label>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.confettiEnabled}
                  onChange={(e) => onSettingsChange({
                    ...settings,
                    confettiEnabled: e.target.checked,
                  })}
                  className="w-5 h-5 text-primary"
                />
                <span>彩纸特效</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emojiEnabled}
                  onChange={(e) => onSettingsChange({
                    ...settings,
                    emojiEnabled: e.target.checked,
                  })}
                  className="w-5 h-5 text-primary"
                />
                <span>Emoji雨特效</span>
              </label>

              <div>
                <label className="block text-sm mb-2">
                  Emoji列表（用逗号分隔）
                </label>
                <input
                  type="text"
                  value={settings.emojiList.join(', ')}
                  onChange={(e) => handleEmojiChange(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white"
                  placeholder="🎉, 🎊, 🌟, ✨"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 mb-4">
              <Image className="text-primary" size={20} />
              <span className="font-medium">背景设置</span>
            </label>

            <div className="space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={() => onSettingsChange({ ...settings, backgroundType: 'none' })}
                  className={`px-3 py-2 rounded-lg flex-1 ${
                    settings.backgroundType === 'none' ? 'bg-primary' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  无背景
                </button>
                <button
                  onClick={() => onSettingsChange({ ...settings, backgroundType: 'color' })}
                  className={`px-3 py-2 rounded-lg flex-1 ${
                    settings.backgroundType === 'color' ? 'bg-primary' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  纯色
                </button>
                <button
                  onClick={() => onSettingsChange({ ...settings, backgroundType: 'image' })}
                  className={`px-3 py-2 rounded-lg flex-1 ${
                    settings.backgroundType === 'image' ? 'bg-primary' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  图片
                </button>
                <button
                  onClick={() => onSettingsChange({ ...settings, backgroundType: 'video' })}
                  className={`px-3 py-2 rounded-lg flex-1 ${
                    settings.backgroundType === 'video' ? 'bg-primary' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  视频
                </button>
              </div>

              {settings.backgroundType === 'color' && (
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={settings.backgroundColor}
                    onChange={(e) => onSettingsChange({
                      ...settings,
                      backgroundColor: e.target.value,
                    })}
                    className="w-20 h-10 bg-gray-700 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.backgroundColor}
                    onChange={(e) => onSettingsChange({
                      ...settings,
                      backgroundColor: e.target.value,
                    })}
                    className="flex-1 px-3 py-2 bg-gray-700 rounded-lg text-white"
                    placeholder="#000000"
                  />
                </div>
              )}

              {settings.backgroundType === 'image' && (
                <div>
                  <input
                    type="file"
                    ref={bgImageRef}
                    onChange={handleBgImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={() => bgImageRef.current?.click()}
                    className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2"
                  >
                    <Image size={18} />
                    上传背景图片
                    {settings.backgroundImage && <span className="text-primary ml-auto">✓</span>}
                  </button>
                </div>
              )}

              {settings.backgroundType === 'video' && (
                <div>
                  <input
                    type="file"
                    ref={bgVideoRef}
                    onChange={handleBgVideoUpload}
                    accept="video/*"
                    className="hidden"
                  />
                  <button
                    onClick={() => bgVideoRef.current?.click()}
                    className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2"
                  >
                    <Film size={18} />
                    上传背景视频
                    {settings.backgroundVideo && <span className="text-primary ml-auto">✓</span>}
                  </button>
                </div>
              )}

              {(settings.backgroundType === 'image' || settings.backgroundType === 'video') && (
                <div>
                  <label className="block text-sm mb-2">
                    背景模糊度
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={settings.backgroundBlur}
                    onChange={(e) => onSettingsChange({
                      ...settings,
                      backgroundBlur: Number(e.target.value),
                    })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>清晰</span>
                    <span>{settings.backgroundBlur}</span>
                    <span>模糊</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 mb-4">
              <Palette className="text-primary" size={20} />
              <span className="font-medium">主题颜色</span>
            </label>

            <div className="flex gap-2 flex-wrap">
              {presetColors.map((color) => (
                <button
                  key={color}
                  onClick={() => onSettingsChange({ ...settings, primaryColor: color })}
                  className={`w-12 h-12 rounded-lg border-2 ${
                    settings.primaryColor === color
                      ? 'border-white scale-110'
                      : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            <div className="mt-3">
              <label className="block text-sm mb-2">
                自定义颜色
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => onSettingsChange({
                    ...settings,
                    primaryColor: e.target.value,
                  })}
                  className="w-20 h-10 bg-gray-700 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.primaryColor}
                  onChange={(e) => onSettingsChange({
                    ...settings,
                    primaryColor: e.target.value,
                  })}
                  className="flex-1 px-3 py-2 bg-gray-700 rounded-lg text-white"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 mb-4">
              <Type className="text-primary" size={20} />
              <span className="font-medium">标题设置</span>
            </label>

            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-2">
                  主标题
                </label>
                <input
                  type="text"
                  value={settings.fullscreenTitle}
                  onChange={(e) => onSettingsChange({
                    ...settings,
                    fullscreenTitle: e.target.value,
                  })}
                  className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white"
                  placeholder="🔥 FireRoll 幸运抽奖"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">
                  副标题
                </label>
                <input
                  type="text"
                  value={settings.fullscreenSubtitle}
                  onChange={(e) => onSettingsChange({
                    ...settings,
                    fullscreenSubtitle: e.target.value,
                  })}
                  className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white"
                  placeholder="通用抽取 By Chy1029"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-700">
            <div className="space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={handleConfigExport}
                  className="flex-1 px-4 py-3 bg-primary hover:bg-primary-dark rounded-lg flex items-center justify-center gap-2"
                >
                  <FileDown size={20} />
                  导出配置
                </button>

                <label className="flex-1 px-4 py-3 bg-primary hover:bg-primary-dark rounded-lg cursor-pointer flex items-center justify-center gap-2">
                  <FileUp size={20} />
                  导入配置
                  <input
                    ref={configImportRef}
                    type="file"
                    accept=".frwc"
                    onChange={handleConfigImport}
                    className="hidden"
                  />
                </label>
              </div>

              <button
                onClick={() => {
                  onSettingsChange({
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
                    fullscreenSubtitle: '通用抽奖 By Chy1029',
                  })
                }}
                className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg"
              >
                恢复默认设置
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default SettingsPanel