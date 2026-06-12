import Link from "next/link";
import HeroCosmosScene from "@/components/HeroCosmosScene";

export default function HomeHero() {
  return (
    <section id="home" className="psh-home-hero">
      <HeroCosmosScene variant="backdrop" />
      <div className="psh-home-hero__wash" aria-hidden="true" />

      <div className="psh-home-hero__inner">
        <div className="psh-home-hero__copy">
          <div className="psh-home-hero__badge psh-home-hero__entrance psh-home-hero__entrance--badge">
            <span className="psh-home-hero__badge-dot" aria-hidden="true" />
            <span>DIGITAL INNOVATION STUDIO</span>
          </div>

          <h1 className="psh-home-hero__title psh-home-hero__entrance psh-home-hero__entrance--title">
            <span>Building Technology</span>
            <span>
              for the <strong>Next</strong>
            </span>
            <span>
              <strong>Generation</strong> of
            </span>
            <span>Businesses</span>
          </h1>

          <p className="psh-home-hero__subtext whitespace-nowrap psh-home-hero__entrance psh-home-hero__entrance--subtext">
            Web Development &bull; Mobile Apps &bull; Digital Marketing &bull; Music Distribution
          </p>

          <div className="psh-home-hero__actions psh-home-hero__entrance psh-home-hero__entrance--actions" aria-label="Hero actions">
            <Link href="/contact" className="psh-home-hero__button psh-home-hero__button--primary">
              Start a Project
            </Link>
            <Link href="/contact" className="psh-home-hero__button psh-home-hero__button--secondary">
              Book a Discovery Call
            </Link>
          </div>
        </div>

        <div className="psh-home-hero__visual">
          <div className="psh-home-hero__visual-reveal">
            <div className="psh-home-hero__visual-stage">
              <HeroCosmosScene />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
