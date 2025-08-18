import { useEffect, useState } from "react";
import { Motion, spring } from "react-motion";
import "./CustomCursor.css";

const CustomCursor = () => {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <Motion style={{ x: spring(pos.x), y: spring(pos.y) }}>
      {({ x, y }) => (
        <div
          className="cursor-dot"
          style={{ left: x, top: y }}
        />
      )}
    </Motion>
  );
};

export default CustomCursor;
