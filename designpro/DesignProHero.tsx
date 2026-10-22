import { useEffect, useRef, useState } from 'react';
import { useMotionPreference } from './useMotionPreference';
import { ArrowRight, ArrowUpRight, Menu, Pause, Play, X } from 'lucide-react';
import { ShinyText } from './ShinyText';

const VIDEO_URL = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_105406_16f4600d-7a92-4292-b96e-b19156c7830a.mp4';
const panels = {
  'About Us': ['A new perspective on design.', 'DesignPro is a product design education platform for emerging designers ready to grow their expertise, sharpen their vision, and build with a global perspective.'],
  Courses: ['Your next chapter starts here.', 'The next product design program is opening soon. Enrollment dates, curriculum, and program details will be announced with the next intake.'],
  Instructors: ['Learn from a fresh perspective.', 'Meet the educators behind the next program when enrollment opens. The instructor lineup has not been announced yet.'],
  Testimonials: ['Every designer has a story.', 'Graduate stories will be shared here as they become available. Explore what comes next for your own design journey.'],
  Blog: ['Keep your curiosity open.', 'Our design journal is coming soon, with perspectives on product thinking, design craft, and creative leadership.'],
  'Contact us': ['Let’s start a conversation.', 'Contact details will be announced alongside the next program. In the meantime, you can explore the existing English learning library.'],
  enrollment: ['Your next chapter is coming.', 'Seats for the next program are opening soon. Applications are not open yet. Return here for enrollment dates and application details.'],
} as const;
type Panel = keyof typeof panels;
const links = ['Home', 'About Us', 'Courses', 'Instructors', 'Testimonials', 'Blog', 'Contact us'] as const;

export function DesignProHero() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [panel, setPanel] = useState<Panel | null>(null);
  const [paused, setPaused] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const reducedMotion = useMotionPreference();
  const video = useRef<HTMLVideoElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!video.current) return;
    if (paused || reducedMotion) video.current.pause();
    else void video.current.play().catch(() => setPaused(true));
  }, [paused, reducedMotion]);

  useEffect(() => {
    if (panel) dialog.current?.showModal();
    else dialog.current?.close();
  }, [panel]);

  function navigate(label: typeof links[number]) {
    setMenuOpen(false);
    if (label === 'Home') { setPanel(null); window.scrollTo({ top: 0 }); }
    else setPanel(label);
  }

  return (
    <main id="home" className="relative isolate h-screen min-h-[700px] overflow-hidden bg-zinc-950 text-white">
      <video ref={video} className="absolute inset-0 h-full w-full object-cover" autoPlay={!reducedMotion && !paused} loop muted playsInline preload="auto" aria-hidden="true" onPlay={() => { if (paused || reducedMotion) video.current?.pause(); }} onError={() => setVideoFailed(true)}>
        <source src={VIDEO_URL} type="video/mp4" />
      </video>
      <div className="hero-scrim absolute inset-0" />
      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col px-6 md:px-10">
        <header className="flex items-center justify-between gap-5 py-7 md:py-9 premium-header sticky top-0 z-20 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md">
          <a href="#home" aria-label="DesignPro home" className="flex shrink-0 items-center gap-2.5 text-xl font-semibold tracking-tight">
            <span className="flex size-8 items-center justify-center rounded-full border-2 border-white"><span className="size-3.5 rounded-full bg-white" /></span>
            DesignPro
          </a>
          <nav aria-label="Main navigation" className="hidden items-center gap-5 rounded-full border border-white/10 px-6 py-3.5 text-sm lg:flex xl:gap-7">
            {links.map(label => <button key={label} type="button" onClick={() => navigate(label)} className="flex items-center gap-2 whitespace-nowrap text-white/70 transition-colors hover:text-white">{label}{label === 'Contact us' && <ArrowUpRight size={15} aria-hidden="true" />}</button>)}
          </nav>
          <button ref={menuButton} type="button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(!menuOpen)} className="rounded-full border border-white/10 p-2.5 lg:hidden">{menuOpen ? <X size={22} /> : <Menu size={22} />}</button>
        </header>
        {menuOpen && <nav id="mobile-navigation" aria-label="Mobile navigation" onKeyDown={event => { if (event.key === 'Escape') { setMenuOpen(false); menuButton.current?.focus(); } }} className="absolute inset-x-6 top-24 z-30 flex flex-col rounded-2xl border border-white/10 bg-zinc-950 p-3 lg:hidden">{links.map(label => <button key={label} onClick={() => navigate(label)} className="flex items-center justify-between rounded-lg px-4 py-3 text-left text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white">{label}<ArrowUpRight size={15} /></button>)}</nav>}
        <div className="mt-6 grid gap-5 text-sm leading-relaxed text-white/70 md:mt-9 md:text-base lg:grid-cols-2">
          <p className="max-w-[420px]">We deliver transformative programs that empower emerging product designers with cutting-edge expertise and vision to thrive globally.</p>
          <p className="lg:text-right font-serif text-[#D4AF37]">8000+ Talented Designers Launched !</p>
        </div>
        <section aria-labelledby="hero-title" className="flex flex-1 flex-col items-center justify-center pb-20 pt-14 text-center md:pb-24">
          <p className="mb-7 text-xs uppercase tracking-widest text-[#D4AF37] md:mb-9 md:text-sm">Seats for Next Program Opening Soon</p>
          <h1 id="hero-title" className="hero-heading text-5xl font-normal tracking-tight sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-serif">
            <span className="block">Become</span>
            <ShinyText text="Product Leader." className="mt-3 block" paused={paused} />
          </h1>
          <button type="button" onClick={() => setPanel('enrollment')} className="enrollment group mt-10 inline-flex items-center gap-5 rounded-full bg-teal-700 px-6 py-3 text-sm font-medium transition-colors hover:bg-teal-800 md:mt-12 md:px-8 md:py-4 border border-white/10">
            Apply for Next Enrollment <ArrowRight size={18} aria-hidden="true" className="cta-arrow transition-transform duration-300" />
          </button>
        </section>
        <footer className="flex items-end justify-between gap-4 pb-6 text-xs text-white/70 md:pb-8 rounded-t-2xl border-t border-white/10 bg-black/40 px-4 pt-5 backdrop-blur-md">
          <a href="./index_hub.html" className="inline-flex items-center gap-2 transition-colors hover:text-white">Explore the English learning library <ArrowUpRight size={14} aria-hidden="true" /></a>
          {!videoFailed && !reducedMotion && <button type="button" aria-label={paused ? 'Play background motion' : 'Pause background motion'} onClick={() => setPaused(!paused)} className="rounded-full border border-white/30 p-2.5 transition-colors hover:border-white">{paused ? <Play size={14} /> : <Pause size={14} />}</button>}
        </footer>
      </div>
      <dialog ref={dialog} aria-labelledby="panel-title" onCancel={() => setPanel(null)} onClose={() => setPanel(null)} onClick={event => { if (event.target === event.currentTarget) setPanel(null); }} className="info-dialog rounded-3xl border border-white/10 bg-zinc-900 p-7 text-white md:p-10">
        <button type="button" autoFocus aria-label="Close dialog" onClick={() => setPanel(null)} className="absolute right-5 top-5 rounded-full p-2 text-white/70 hover:bg-gray-800 hover:text-white"><X size={20} /></button>
        {panel && <><p className="mb-6 text-sm text-[#D4AF37]">DesignPro / {panel === 'enrollment' ? 'Next enrollment' : panel}</p><h2 id="panel-title" className="pr-5 text-3xl font-medium tracking-tight font-serif">{panels[panel][0]}</h2><p className="mt-5 leading-relaxed text-white/70">{panels[panel][1]}</p>{panel === 'Contact us' && <a href="./index_hub.html" className="mt-6 inline-flex items-center gap-2 text-sm text-[#D4AF37]">Open learning library <ArrowUpRight size={16} /></a>}</>}
      </dialog>
    </main>
  );
}
