// Decorative media follows the existing effects preference; learning behavior is unchanged.
(() => {
  const video = document.querySelector('.home-video');
  if (!video) return;
  function syncVideo() {
    const still = document.documentElement.classList.contains('lr-effects-off') || document.hidden;
    video.autoplay = !still;
    if (still) video.pause();
    else video.play().catch(() => {});
  }
  video.addEventListener('play', () => {
    if (document.documentElement.classList.contains('lr-effects-off')) video.pause();
  });
  document.addEventListener('lr-effects', syncVideo);
  document.addEventListener('visibilitychange', syncVideo);
  syncVideo();
})();
