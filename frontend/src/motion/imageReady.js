// Start image-bearing entrances only after their pixels can be painted.
// Called on entry, so offscreen sections retain native lazy loading.
export function whenImagesReady(root, onReady) {
  const images = root.matches('img') ? [root] : [...root.querySelectorAll('img')]
  if (!images.length) { onReady(); return () => {} }
  let cancelled = false
  const cleanups = new Set()
  const pending = images.map(image => new Promise(resolve => {
    const removeListeners = () => {
      image.removeEventListener('load', loaded)
      image.removeEventListener('error', finish)
    }
    function finish() {
      removeListeners()
      cleanups.delete(finish)
      resolve()
    }
    function loaded() {
      removeListeners()
      // Broken images must not block captions, links or the rest of the group.
      if (!image.naturalWidth) { finish(); return }
      image.decode().catch(() => {}).then(finish)
    }
    cleanups.add(finish)
    if (image.complete) loaded()
    else {
      image.addEventListener('load', loaded, { once: true })
      image.addEventListener('error', finish, { once: true })
      // A staggered group may contain lazy images in lower rows or slides.
      // Load them once the group enters; otherwise waiting could deadlock.
      if (image.loading === 'lazy') image.loading = 'eager'
    }
  }))
  Promise.all(pending).then(() => { if (!cancelled) onReady() })
  return () => {
    cancelled = true
    cleanups.forEach(finish => finish())
  }
}
