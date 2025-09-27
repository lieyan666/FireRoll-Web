import { LotterySettings } from '../types'

// Config file metadata
export interface ConfigFile {
  version: string
  timestamp: number
  app: string
  settings: LotterySettings
}

// Current config version
const CONFIG_VERSION = '1.0.0'
const APP_NAME = 'FireRoll'

// Validate imported settings
export const validateSettings = (settings: any): settings is LotterySettings => {
  try {
    // Check required fields exist
    const requiredFields = [
      'animationSpeed',
      'soundEnabled',
      'emojiEnabled',
      'confettiEnabled',
      'primaryColor',
      'allowDuplicate',
      'backgroundType',
      'backgroundColor',
      'backgroundBlur',
      'animationType',
      'fullscreenTitle',
      'fullscreenSubtitle'
    ]

    for (const field of requiredFields) {
      if (!(field in settings)) {
        console.error(`Missing required field: ${field}`)
        return false
      }
    }

    // Validate types
    if (typeof settings.animationSpeed !== 'number' ||
        settings.animationSpeed < 1 ||
        settings.animationSpeed > 10) {
      console.error('Invalid animationSpeed')
      return false
    }

    if (typeof settings.soundEnabled !== 'boolean' ||
        typeof settings.emojiEnabled !== 'boolean' ||
        typeof settings.confettiEnabled !== 'boolean' ||
        typeof settings.allowDuplicate !== 'boolean') {
      console.error('Invalid boolean fields')
      return false
    }

    if (!['none', 'color', 'image', 'video'].includes(settings.backgroundType)) {
      console.error('Invalid backgroundType')
      return false
    }

    if (!['spin', 'flip', 'zoom', 'slide', 'bounce', 'fade'].includes(settings.animationType)) {
      console.error('Invalid animationType')
      return false
    }

    if (!Array.isArray(settings.emojiList)) {
      console.error('Invalid emojiList')
      return false
    }

    return true
  } catch (error) {
    console.error('Settings validation error:', error)
    return false
  }
}

// Export settings to .frwc file
export const exportSettings = (settings: LotterySettings, filename?: string) => {
  try {
    const configFile: ConfigFile = {
      version: CONFIG_VERSION,
      timestamp: Date.now(),
      app: APP_NAME,
      settings: settings
    }

    const jsonContent = JSON.stringify(configFile, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = filename || `fireroll_config_${Date.now()}.frwc`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    return true
  } catch (error) {
    console.error('Export settings error:', error)
    return false
  }
}

// Import settings from .frwc file
export const importSettings = (file: File): Promise<LotterySettings | null> => {
  return new Promise((resolve) => {
    if (!file.name.endsWith('.frwc')) {
      alert('请选择有效的配置文件（.frwc）')
      resolve(null)
      return
    }

    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const configFile: ConfigFile = JSON.parse(content)

        // Validate config file structure
        if (!configFile.version || !configFile.settings || configFile.app !== APP_NAME) {
          alert('无效的配置文件格式')
          resolve(null)
          return
        }

        // Check version compatibility (for future use)
        const [majorVersion] = configFile.version.split('.')
        const [currentMajor] = CONFIG_VERSION.split('.')
        if (majorVersion !== currentMajor) {
          const proceed = confirm('配置文件版本不匹配，继续导入可能导致问题。是否继续？')
          if (!proceed) {
            resolve(null)
            return
          }
        }

        // Validate settings
        if (!validateSettings(configFile.settings)) {
          alert('配置文件内容无效')
          resolve(null)
          return
        }

        resolve(configFile.settings)
      } catch (error) {
        console.error('Import settings error:', error)
        alert('读取配置文件失败')
        resolve(null)
      }
    }

    reader.onerror = () => {
      alert('读取文件失败')
      resolve(null)
    }

    reader.readAsText(file)
  })
}

// Save settings to localStorage
export const saveSettingsToStorage = (settings: LotterySettings) => {
  try {
    localStorage.setItem('lotterySettings', JSON.stringify(settings))
    return true
  } catch (error) {
    console.error('Save to localStorage error:', error)
    return false
  }
}

// Load settings from localStorage
export const loadSettingsFromStorage = (): LotterySettings | null => {
  try {
    const stored = localStorage.getItem('lotterySettings')
    if (!stored) return null

    const settings = JSON.parse(stored)
    if (validateSettings(settings)) {
      return settings
    }
    return null
  } catch (error) {
    console.error('Load from localStorage error:', error)
    return null
  }
}