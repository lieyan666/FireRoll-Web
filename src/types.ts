export interface Participant {
  id: number
  name: string
}

export interface Winner extends Participant {
  timestamp: number
}

export interface LotterySettings {
  animationSpeed: number
  soundEnabled: boolean
  emojiEnabled: boolean
  confettiEnabled: boolean
  backgroundMusic: string | null
  winnerSound: string | null
  emojiList: string[]
  primaryColor: string
  allowDuplicate: boolean
  backgroundType: 'none' | 'color' | 'image' | 'video'
  backgroundColor: string
  backgroundImage: string | null
  backgroundVideo: string | null
  backgroundBlur: number
  animationType: 'spin' | 'flip' | 'zoom' | 'slide' | 'bounce' | 'fade'
  fullscreenTitle: string
  fullscreenSubtitle: string
}