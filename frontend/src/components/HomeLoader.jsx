// frontend/src/components/HomeLoader.jsx
import React, { useEffect, useState } from "react";
import "./HomeLoader.css";

export default function HomeLoader() {
  const [items, setItems] = useState([]);
  const [score, setScore] = useState(0);

  // Spawn falling items
  useEffect(() => {
    const interval = setInterval(() => {
      setItems((prev) => [
        ...prev,
        {
          id: Date.now(),
          left: Math.random() * 90,
        },
      ]);
    }, 800);

    return () => clearInterval(interval);
  }, []);

  // Remove items automatically
  useEffect(() => {
    const cleanup = setInterval(() => {
      setItems((prev) => prev.slice(-6));
    }, 2000);

    return () => clearInterval(cleanup);
  }, []);

  const catchItem = (id) => {
    setScore((s) => s + 1);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="game-loader">
      <h2>Loading Store</h2>
      <p>Catch items while we prepare your products</p>

      <div className="score">Score: {score}</div>

      <div className="game-area">
        {items.map((item) => (
          <div
            key={item.id}
            className="falling-item"
            style={{ left: `${item.left}%` }}
            onClick={() => catchItem(item.id)}
          >
            🛒
          </div>
        ))}
      </div>
    </div>
  );
}
