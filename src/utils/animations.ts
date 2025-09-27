export type AnimationType = 'spin' | 'flip' | 'zoom' | 'slide' | 'bounce' | 'fade'

export interface LotteryAnimation {
  type: AnimationType
  name: string
  description: string
}

export const LOTTERY_ANIMATIONS: LotteryAnimation[] = [
  { type: 'spin', name: '旋转', description: '经典旋转动画' },
  { type: 'flip', name: '翻转', description: '3D翻转效果' },
  { type: 'zoom', name: '缩放', description: '缩放弹出效果' },
  { type: 'slide', name: '滑动', description: '横向滑动切换' },
  { type: 'bounce', name: '弹跳', description: '弹跳进入效果' },
  { type: 'fade', name: '淡入', description: '渐变淡入效果' },
]

export const getAnimationVariants = (type: AnimationType) => {
  switch (type) {
    case 'spin':
      return {
        initial: { scale: 0, rotate: -180, opacity: 0 },
        animate: { scale: 1, rotate: 0, opacity: 1 },
        exit: { scale: 0, rotate: 180, opacity: 0 },
        transition: { type: "spring", damping: 10, stiffness: 100 }
      }
    case 'flip':
      return {
        initial: { rotateY: -90, opacity: 0 },
        animate: { rotateY: 0, opacity: 1 },
        exit: { rotateY: 90, opacity: 0 },
        transition: { type: "spring", damping: 15 }
      }
    case 'zoom':
      return {
        initial: { scale: 0.3, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 2, opacity: 0 },
        transition: { duration: 0.3 }
      }
    case 'slide':
      return {
        initial: { x: -300, opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: 300, opacity: 0 },
        transition: { type: "spring", damping: 20 }
      }
    case 'bounce':
      return {
        initial: { y: -100, scale: 0.8, opacity: 0 },
        animate: { y: 0, scale: 1, opacity: 1 },
        exit: { y: 100, scale: 0.8, opacity: 0 },
        transition: { type: "spring", bounce: 0.5 }
      }
    case 'fade':
      return {
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 1.1 },
        transition: { duration: 0.4 }
      }
    default:
      return {
        initial: { scale: 0, rotate: -180, opacity: 0 },
        animate: { scale: 1, rotate: 0, opacity: 1 },
        exit: { scale: 0, rotate: 180, opacity: 0 },
        transition: { type: "spring", damping: 10 }
      }
  }
}