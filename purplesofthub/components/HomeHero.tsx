import Link from "next/link";
import Reveal from "@/components/Reveal";
import HeroCosmosScene from "@/components/HeroCosmosScene";

export default function HomeHero() {
  return (
    <section id="home" className="psh-home-hero">
      <HeroCosmosScene variant="backdrop" />
      <div className="psh-home-hero__wash" aria-hidden="true" />

      <div className="psh-home-hero__inner">
        <div className="psh-home-hero__copy">
          <Reveal>
            <div className="psh-home-hero__badge">
              <span className="psh-home-hero__badge-dot" aria-hidden="true" />
              <span>DIGITAL INNOVATION STUDIO</span>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <h1 className="psh-home-hero__title">
              <span>Building Technology</span>
              <span>
                for the <strong>Next</strong>
              </span>
              <span>
                <strong>Generation</strong> of
              </span>
              <span>Businesses</span>
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="psh-home-hero__subtext whitespace-nowrap">
              Web Development • Mobile Apps • Digital Marketing • Music Distribution
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="psh-home-hero__actions" aria-label="Hero actions">
              <Link href="/contact" className="psh-home-hero__button psh-home-hero__button--primary">
                Start a Project
              </Link>
              <Link href="/contact" className="psh-home-hero__button psh-home-hero__button--secondary">
                Book a Discovery Call
              </Link>
            </div>
          </Reveal>
        </div>

        <div className="psh-home-hero__visual">
          <Reveal delay={0.15}>
            <HeroCosmosScene />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
