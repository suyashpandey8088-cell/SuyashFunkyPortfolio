import SmoothScroll from '@/components/SmoothScroll';
import CustomCursor from '@/components/CustomCursor';
import Loader from '@/components/Loader';
import Background from '@/components/Background';
import Nav from '@/components/Nav';
import ScrollProgress from '@/components/ScrollProgress';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Experience from '@/components/Experience';
import Skills from '@/components/Skills';
import Projects from '@/components/Projects';
import Chaos from '@/components/Chaos';
import Personality from '@/components/Personality';
import Contact from '@/components/Contact';
import Outro from '@/components/Outro';

export default function Page() {
  return (
    <>
      <a className="skip-link" href="#about">
        Skip to content
      </a>

      <SmoothScroll />
      <Loader />
      <CustomCursor />
      <Background />
      <Nav />
      <ScrollProgress />

      <main id="main">
        <Hero />
        <About />
        <Experience />
        <Skills />
        <Projects />
        <Chaos />
        <Personality />
        <Contact />
        <Outro />
      </main>

      <div className="grain" aria-hidden="true" />
      <div className="scanlines" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />
    </>
  );
}
