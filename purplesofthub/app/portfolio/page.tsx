"use client";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import ProjectCard from "./_components/ProjectCard";
import FeaturedProject from "./_components/FeaturedProject";
import Testimonials from "./_components/Testimonials";
import { fetchPublishedProjectsClient, fetchCategoriesClient, fetchIndustriesClient, fetchServicesClient } from "@/lib/portfolio.client";
import type { PortfolioCategory, PortfolioIndustry, PortfolioService, PortfolioProject } from "@/types/portfolio";

export default function PortfolioPage() {
  const [activeCategory, setActiveCategory] = useState<string>("Featured Projects");
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState<string>("All Industries");
  const [service, setService] = useState<string>("All Services");
  const [year, setYear] = useState<string>("All Years");
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<PortfolioCategory[]>([]);
  const [industries, setIndustries] = useState<PortfolioIndustry[]>([]);
  const [services, setServices] = useState<PortfolioService[]>([]);
  const [publishedProjects, setPublishedProjects] = useState<PortfolioProject[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [cats, inds, svcs, projects] = await Promise.allSettled([
        fetchCategoriesClient(),
        fetchIndustriesClient(),
        fetchServicesClient(),
        fetchPublishedProjectsClient(),
      ]);
      if (cats.status === "fulfilled") setCategories(cats.value || []);
      if (inds.status === "fulfilled") setIndustries(inds.value || []);
      if (svcs.status === "fulfilled") setServices(svcs.value || []);
      if (projects.status === "fulfilled") setPublishedProjects(projects.value || []);
    };
    fetchData();
  }, []);

  const featuredProjects = useMemo(() => {
    return publishedProjects.filter((p: PortfolioProject) => p.featured).slice(0, 6);
  }, [publishedProjects]);

  const filteredProjects = useMemo(() => {
    let projects = featuredProjects;
    if (activeCategory === "Featured Projects") {
      projects = projects.filter((p: PortfolioProject) => p.featured);
    } else if (activeCategory !== "All Projects") {
      projects = projects.filter((p: PortfolioProject) => p.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      projects = projects.filter(
        (p: PortfolioProject) =>
          p.title.toLowerCase().includes(q) ||
          (p.overview?.toLowerCase().includes(q) ?? false) ||
          (p.tags ?? []).some((t: string) => t.toLowerCase().includes(q)) ||
          (p.client_name && p.client_name.toLowerCase().includes(q)) ||
          (p.industry && p.industry.toLowerCase().includes(q))
      );
    }
    if (industry !== "All Industries") {
      projects = projects.filter((p: PortfolioProject) => p.industry === industry);
    }
    if (service !== "All Services") {
      projects = projects.filter((p: PortfolioProject) => p.service === service);
    }
    if (year !== "All Years") {
      projects = projects.filter((p: PortfolioProject) => p.year === year);
    }
    return projects;
  }, [activeCategory, search, industry, service, year, featuredProjects]);

  const stats = useMemo(
    () => [
      { value: `${featuredProjects.length}+`, label: "Projects Completed" },
      { value: "28", label: "Happy Clients" },
      { value: "10+", label: "Years Experience" },
      { value: `${categories.length}`, label: "Industries Served" },
      { value: "150+", label: "Design Assets Created" },
      { value: "45", label: "Websites Delivered" },
      { value: "30", label: "Videos Produced" },
    ],
    [featuredProjects.length, categories.length]
  );

  return (
    <main style={{ background: "var(--bg-primary)", color: "var(--text-primary)", minHeight: "100vh", overflowX: "hidden" }}>
      <Navbar />

      {/* ============ PREMIUM HERO SECTION ============ */}
      <section style={{
        position: "relative",
        overflow: "hidden",
        padding: "200px 5% 160px",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        background: "var(--bg-primary)",
        transition: "background-color 0.5s",
      }}>
        <div style={{
          position: "absolute",
          top: -100,
          right: -50,
          width: 400,
          height: 400,
          background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute",
          bottom: -50,
          left: -50,
          width: 300,
          height: 300,
          background: "radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute",
          inset: 0,
          background: "var(--bg-pattern)",
          pointerEvents: "none",
          opacity: 0.3,
          backgroundSize: "400px 400px",
        }} />
        <div style={{ position: "relative", zIndex: 2, maxWidth: 1200, width: "100%" }}>
          <motion.div
            animate={{ y: [0, -20, 0], transition: { duration: 3, repeat: Infinity, ease: "easeInOut" } }}
            style={{ position: "relative", display: "flex", gap: 32, justifyContent: "center", marginBottom: 64 }}
          >
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{ width: 280, height: 180, background: "var(--bg-card)", borderRadius: 24, overflow: "hidden", border: "1px solid rgba(124,58,237,0.15)", position: "relative" }}
            >
              <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${featuredProjects.length > 0 ? featuredProjects[0].color : "#7c3aed"}22, rgba(124,58,237,0.05))`, borderRadius: 24 }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 24, background: "linear-gradient(transparent, rgba(0,0,0,0.3))" }}>
                <div style={{ fontSize: 64, marginBottom: 8 }}>{featuredProjects[0]?.emoji || "🎨"}</div>
                <h4 style={{ fontFamily: "Outfit", fontSize: 18, fontWeight: 600, color: "var(--text-primary)" }}>Modern Brand Identity</h4>
                <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>Complete brand system</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{ width: 280, height: 180, background: "var(--bg-card)", borderRadius: 24, overflow: "hidden", border: "1px solid rgba(124,58,237,0.15)", position: "relative" }}
            >
              <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${featuredProjects[1]?.color || "#a855f7"}22, rgba(168,85,247,0.05))`, borderRadius: 24 }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 24, background: "linear-gradient(transparent, rgba(0,0,0,0.3))" }}>
                <div style={{ fontSize: 64, marginBottom: 8 }}>{featuredProjects[1]?.emoji || "📱"}</div>
                <h4 style={{ fontFamily: "Outfit", fontSize: 18, fontWeight: 600, color: "var(--text-primary)" }}>Responsive Website</h4>
                <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>Full stack development</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{ width: 280, height: 180, background: "var(--bg-card)", borderRadius: 24, overflow: "hidden", border: "1px solid rgba(124,58,237,0.15)", position: "relative" }}
            >
              <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${featuredProjects[2]?.color || "#ec4899"}22, rgba(236,72,153,0.05))`, borderRadius: 24 }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 24, background: "linear-gradient(transparent, rgba(0,0,0,0.3))" }}>
                <div style={{ fontSize: 64, marginBottom: 8 }}>{featuredProjects[2]?.emoji || "🚀"}</div>
                <h4 style={{ fontFamily: "Outfit", fontSize: 18, fontWeight: 600, color: "var(--text-primary)" }}>AI Creative Studio</h4>
                <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>Generative design</p>
              </div>
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(124,58,237,.1)", border: "1px solid rgba(168,85,247,.3)", borderRadius: 100, padding: "6px 16px", marginBottom: 32, fontSize: 12, fontWeight: 600, color: "#6d28d9", letterSpacing: 1 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#a855f7", boxShadow: "0 0 8px #a855f7", display: "inline-block" }} />
              OUR WORK
            </div>
            <h1 style={{ fontFamily: "Outfit", fontSize: "clamp(48px,10vw,100px)", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-3px", lineHeight: 1.1, marginBottom: 24, background: "linear-gradient(135deg,#7c3aed,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginTop: 0 }}>
              A Digital Showroom of <span className="grad-text">Creative Excellence</span>
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: 20, lineHeight: 1.8, maxWidth: 700, margin: "0 auto 48px", fontWeight: 400 }}>
              Explore our portfolio of branding, websites, publications, content creation, AI innovation and creative strategy — crafted to build trust, showcase quality, and convert visitors into clients.
            </p>
            <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/portfolio">
                <button className="btn-main animate-glow" style={{ padding: "20px 48px", fontSize: 18, fontWeight: 700, background: "linear-gradient(135deg,#7c3aed,#a855f7)", color: "#fff", border: "none", borderRadius: 12, boxShadow: "0 8px 32px rgba(124,58,237,0.4)", transition: "all 0.3s" }}>
                  View Projects →
                </button>
              </Link>
              <Link href="/contact">
                <button className="btn-outline" style={{ padding: "20px 48px", fontSize: 18, fontWeight: 700, background: "transparent", color: "var(--text-primary)", border: "2px solid rgba(124,58,237,0.3)", borderRadius: 12, transition: "all 0.3s" }}>Start Your Project →</button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ STATISTICS SECTION ============ */}
      <section style={{ padding: "80px 5%", background: "var(--bg-secondary)", position: "relative", overflow: "hidden" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 32, marginBottom: 64 }}>
            {stats.map((stat, i) => (
              <div key={stat.label} style={{ textAlign: "center" }}>
                <div style={{ width: 80, height: 80, margin: "0 auto 24px", background: "var(--bg-card)", borderRadius: 20, border: "1px solid rgba(124,58,237,0.15)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
                  <div style={{ width: 40, height: 40 }}>
                    {stat.label.includes("Years") ? "🏆" : stat.label.includes("Clients") ? "👥" : "💡"}
                  </div>
                </div>
                <div style={{ fontFamily: "Outfit", fontSize: "clamp(32px,8vw,48px)", fontWeight: 900, background: "linear-gradient(135deg,#7c3aed,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 4, lineHeight: 1 }}>
                  {stat.value}
                </div>
                <div style={{ color: "var(--text-muted)", fontSize: 14, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <h2 style={{ fontFamily: "Outfit", fontSize: "clamp(32px,6vw,48px)", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-1.5px", textAlign: "center", marginBottom: 32 }}>
              <span className="grad-text">Featured</span> Work
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
              {featuredProjects.map((project: PortfolioProject, i: number) => (
                <FeaturedProject key={project.slug} project={project} index={i} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ PORTFOLIO CATEGORIES FILTER ============ */}
      <section style={{ padding: "60px 5%", background: "var(--bg-primary)", position: "relative", overflow: "hidden" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 40, justifyContent: "center" }}>
            {categories.map((cat: PortfolioCategory) => {
              const catValue = cat.slug || cat.name;
              return (
                <button
                  key={catValue}
                  onClick={() => setActiveCategory(catValue)}
                  style={{
                    padding: "10px 24px",
                    borderRadius: 100,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.3s",
                    background: activeCategory === catValue ? "linear-gradient(135deg,#7c3aed,#a855f7)" : "rgba(124,58,237,.08)",
                    border: activeCategory === catValue ? "1px solid transparent" : "1px solid rgba(124,58,237,.2)",
                    color: activeCategory === catValue ? "#fff" : "#6d28d9",
                    boxShadow: activeCategory === catValue ? "0 4px 16px rgba(124,58,237,.3)" : "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <span style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 500 }}>
              Showing <strong style={{ color: "#6d28d9" }}>{filteredProjects.length}</strong> {filteredProjects.length === 1 ? "project" : "projects"}
              {activeCategory !== "All Projects" && activeCategory !== "Featured Projects" && ` in ${activeCategory}`}
            </span>
          </div>
        </div>
      </section>

      <Testimonials />

      {/* ============ CTA SECTION ============ */}
      <section style={{ padding: "120px 5% 100px", position: "relative", overflow: "hidden", textAlign: "center" }}>
        <div style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at 50% 50%,rgba(124,58,237,.15) 0%,transparent 60%)",
          pointerEvents: "none",
        }} />
        <div className="grid-bg" style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.5 }} />
        <div style={{ maxWidth: 800, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <h2 style={{ fontFamily: "Outfit", fontSize: "clamp(36px,8vw,56px)", fontWeight: 900, color: "var(--text-primary)", letterSpacing: "-2px", lineHeight: 1.1, marginBottom: 24 }}>
            Ready to Build Something <span className="grad-text">Extraordinary?</span>
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: 18, lineHeight: 1.8, maxWidth: 600, margin: "0 auto 48px" }}>
            Let's create work that builds trust, showcases quality, and converts visitors into clients. Your vision deserves world-class execution.
          </p>
          <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/contact">
              <button className="btn-main animate-glow" style={{ padding: "24px 48px", fontSize: 20, fontWeight: 700, background: "linear-gradient(135deg,#7c3aed,#a855f7)", color: "#fff", border: "none", borderRadius: 12, boxShadow: "0 8px 32px rgba(124,58,237,0.4)", transition: "all 0.3s" }}>Book Consultation →</button>
            </Link>
            <Link href="/contact">
              <button className="btn-outline" style={{ padding: "24px 48px", fontSize: 20, fontWeight: 700, background: "transparent", color: "var(--text-primary)", border: "2px solid rgba(124,58,237,0.3)", borderRadius: 12, transition: "all 0.3s" }}>Request Quote</button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}