import { gsap } from './gsap'
import { motionTiming } from './settings'

const photographSelector = [
  '.page-hero figure > img', '.weight-loss-image',
  '.editorial-image:not(.customization-image)', '.guide-card > img',
  '.enquiry-photo img', '.workplace-gallery img',
].join(',')

// Clip the enlarged photograph to its ORIGINAL painted bounds. This lets an
// existing <img> act as its own frame, without wrapping nodes or moving captions.
export function createPageParallax(root, mobile) {
  const images = [...root.querySelectorAll(photographSelector)]
  const measurements = images.map(image => ({
    image, width: image.offsetWidth, height: image.offsetHeight,
    radius: parseFloat(getComputedStyle(image).borderTopLeftRadius) || 0,
  }))
  const activeImages = new Set()
  for (const initial of measurements) {
    const { image } = initial
    if (!initial.width || !initial.height) continue
    activeImages.add(image)
    const scale = mobile ? 1.045 : 1.065
    let size = initial
    let travel
    const measure = () => {
      size = { width: image.offsetWidth, height: image.offsetHeight,
        radius: parseFloat(getComputedStyle(image).borderTopLeftRadius) || 0 }
      // Leave enough overscan at both ends, even for short landscape images.
      travel = Math.min(mobile ? 6 : 12, size.height * (scale - 1) * 0.4)
    }
    measure()
    const mask = y => {
      const vertical = size.height * (scale - 1) / 2
      const horizontal = size.width * (scale - 1) / (2 * scale)
      return `inset(${(vertical - y) / scale}px ${horizontal}px ${(vertical + y) / scale}px ${horizontal}px round ${size.radius / scale}px)`
    }
    gsap.set(image, { willChange: 'auto' })
    gsap.fromTo(image,
      { y: () => travel, scale, clipPath: () => mask(travel), transformOrigin: '50% 50%' },
      { y: () => -travel, scale, clipPath: () => mask(-travel), ease: 'none', force3D: false,
        scrollTrigger: {
          id: `dlim-depth-${activeImages.size}`,
          trigger: image.parentElement,
          start: 'clamp(top bottom)', end: 'clamp(bottom top)',
          scrub: mobile ? motionTiming.parallaxScrubMobile : motionTiming.parallaxScrub,
          invalidateOnRefresh: true,
          onRefreshInit: measure,
          onToggle: self => {
            if (self.isActive) image.style.willChange = 'transform, clip-path'
          },
          onScrubComplete: self => {
            if (!self.isActive) image.style.willChange = 'auto'
          },
        },
      },
    )
  }
  return activeImages
}
