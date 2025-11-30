import { useState, useEffect } from 'react'; // <--- Importamos useEffect
import { Navbar } from './components/Navbar';
import './Landing.css';
import { Header } from './components/Header';
import { About } from './components/About';
import { Team } from './components/Team';
import { Affiliation } from './components/Affiliation';
import { CallToAction } from './components/CallToAction';
import { Footer } from './components/Footer';

type SectionId = 'inicio' | 'sobre' | 'quem-somos' | 'parceiros';

export default function Landing() {
  const [activeSection, setActiveSection] = useState<SectionId>('inicio');

  useEffect(() => {
    const sections = document.querySelectorAll('section[id]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id as SectionId);
          }
        });
      },
      {
        root: null, // viewport
        rootMargin: '-50% 0px -50% 0px',
        threshold: 0,
      }
    );

    sections.forEach((sec) => observer.observe(sec));

    return () => {
      sections.forEach((sec) => observer.unobserve(sec));
    };
  }, []);

  const handleNavigate = (section: string) => {
    setActiveSection(section as SectionId);
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-page">
      <Navbar activeSection={activeSection} onNavigate={handleNavigate} />
      <Header />
      <About />
      <Team />
      <Affiliation />
      <CallToAction />
      <Footer />
    </div>
  );
}