"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TESTIMONIALS } from "../_data/portfolio";

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const goTo = (index: number) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  };

  const testimonial = TESTIMONIALS[current];

  return (
    <section style={{ padding: "80px 5%", position: "relative", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at 50% 50%, rgba(124,58,237,0.08) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />
      <div style={{ maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 2 }}>
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: "center", marginBottom: 48 }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(124,58,237,0.12)",
              border: "1px solid rgba(168,85,247,0.3)",
              borderRadius: 100,
              padding: "6px 16px",
              marginBottom: 16,
              fontSize: 12,
              fontWeight: 600,
              color: "#6d28d9",
              letterSpacing: 1,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#a855f7",
                boxShadow: "0 0 8px #a855f7",
                display: "inline-block",
              }}
            />
            CLIENT TESTIMONIALS
          </div>
          <h2
            style={{
              fontFamily: "Outfit",
              fontSize: "clamp(28px,4vw,44px)",
              fontWeight: 900,
              color: "var(--text-primary)",
              letterSpacing: "-1.5px",
              margin: 0,
            }}
          >
            What Our <span className="grad-text">Clients Say</span>
          </h2>
        </motion.div>

        {/* Testimonial Card */}
        <div
          style={{
            position: "relative",
            minHeight: 320,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              initial={{ opacity: 0, x: direction * 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -60 }}
              transition={{ duration: 0.4 }}
              className="glass-card"
              style={{
                padding: "40px 36px",
                textAlign: "center",
                maxWidth: 700,
                width: "100%",
                position: "relative",
              }}
            >
              {/* Quote mark */}
              <div
                style={{
                  fontSize: 64,
                  color: "#a855f7",
                  opacity: 0.3,
                  lineHeight: 1,
                  marginBottom: 8,
                  fontFamily: "Georgia, serif",
                }}
              >
                &ldquo;
              </div>

              {/* Stars */}
              <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 20 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    style={{ fontSize: 20, color: i < testimonial.rating ? "#f59e0b" : "#d1d5db" }}
                  >
                    ★
                  </motion.span>
                ))}
              </div>

              {/* Review */}
              <p
                style={{
                  fontSize: 16,
                  lineHeight: 1.8,
                  color: "var(--text-secondary)",
                  margin: "0 0 24px",
                  fontStyle: "italic",
                }}
              >
                {testimonial.review}
              </p>

              {/* Client info */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    fontWeight: 800,
                    color: "#fff",
                    boxShadow: "0 4px 16px rgba(124,58,237,0.4)",
                  }}
                >
                  {testimonial.name.charAt(0)}
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>
                    {testimonial.name}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    {testimonial.company}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 28 }}>
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              style={{
                width: i === current ? 28 : 8,
                height: 8,
                borderRadius: 100,
                border: "none",
                cursor: "pointer",
                background: i === current ? "linear-gradient(135deg, #7c3aed, #a855f7)" : "rgba(124,58,237,0.2)",
                transition: "all 0.3s ease",
                padding: 0,
              }}
              aria-label={`Go to testimonial ${i + 1}`}
            />
          ))}
        </div>

        {/* Prev/Next arrows */}
        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 20 }}>
          <button
            onClick={() => {
              setDirection(-1);
              setCurrent((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
            }}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: "1px solid rgba(124,58,237,0.3)",
              background: "rgba(124,58,237,0.08)",
              color: "#6d28d9",
              fontSize: 16,
              cursor: "pointer",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(124,58,237,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(124,58,237,0.08)";
            }}
            aria-label="Previous testimonial"
          >
            ←
          </button>
          <button
            onClick={() => {
              setDirection(1);
              setCurrent((prev) => (prev + 1) % TESTIMONIALS.length);
            }}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: "1px solid rgba(124,58,237,0.3)",
              background: "rgba(124,58,237,0.08)",
              color: "#6d28d9",
              fontSize: 16,
              cursor: "pointer",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(124,58,237,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(124,58,237,0.08)";
            }}
            aria-label="Next testimonial"
          >
            →
          </button>
        </div>
      </div>
    </section>
  );
}