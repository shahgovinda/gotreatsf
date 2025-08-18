import { useEffect, useRef } from "react";
import "./customCursor.css";

/**
 * Ultra-smooth custom cursor (dot only) using requestAnimationFrame + lerp.
 * No external libraries. Fully hides the native cursor globally.
 */
const CustomCursor = () => {
  const dotRef = useRef<HTMLDivElement | null>(null);

  // Current animated position
  const xRef = useRef(0);
  const yRef = useRef(0);

  // Target (mouse) position
  const txRef = useRef(0);
  const tyRef = useRef(0);

  // Animation frame id
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // Hide on touch devices (no cursor UX there)
    const isTouch =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      (navigator as any).msMaxTouchPoints > 0;

    if (isTouch) {
      dotRef.current?.classList.add("custom-cursor--hidden");
      return;
    }

    const dot = dotRef.current!;
    dot.style.opacity = "0"; // start hidden until we get first mousemove

    const handleMove = (e: MouseEvent) => {
      txRef.current = e.clientX;
      tyRef.current = e.clientY;
      // show once we have position
      dot.style.opacity = "1";
    };

    const handleEnter = () => {
      dot.classList.remove("custom-cursor--hidden");
    };

    const handleLeave = () => {
      dot.classList.add("custom-cursor--hidden");
    };

    const handleDown = () => {
      dot.classList.add("custom-cursor--down");
    };

    const handleUp = () => {
      dot.classList.remove("custom-cursor--down");
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("mouseenter", handleEnter);
    window.addEventListener("mouseleave", handleLeave);
    window.addEventListener("mousedown", handleDown);
    window.addEventListener("mouseup", handleUp);

    // rAF loop with lerp for buttery motion
    const ease = 0.18; // 0.12–0.22 feels great; higher = faster catch-up
    const animate = () => {
      xRef.current += (txRef.current - xRef.current) * ease;
      yRef.current += (tyRef.current - yRef.current) * ease;

      // translate3d for GPU acceleration
      dot.style.transform = `translate3d(${xRef.current}px, ${yRef.current}px, 0) translate(-50%, -50%)`;

      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseenter", handleEnter);
      window.removeEventListener("mouseleave", handleLeave);
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mouseup", handleUp);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return <div ref={dotRef} className="custom-cursor-dot" aria-hidden="true" />;
};

export default CustomCursor;
