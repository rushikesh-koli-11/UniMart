import React, { useEffect, useState } from "react";
import "./HomeLoader.css";

const facts = [
  "Netflix deploys more than 4,000 microservices to serve over 260 million users worldwide.",
  "A 100 ms delay in website response time can reduce conversion rates by up to 7 percent.",
  "Amazon calculated that every 100 ms of latency costs roughly 1 percent in sales.",
  "Docker reduces environment-related bugs by over 60 percent in production systems.",
  "Companies using CI/CD deploy software 46 times more frequently than manual-release teams.",
  "A well-designed caching layer can reduce backend API load by up to 80 percent.",
  "Cloud cold starts typically take between 30 and 90 seconds depending on container size.",
  "Over 90 percent of modern web applications use REST or GraphQL APIs for communication.",
  "Kubernetes can automatically scale applications from 1 server to 1,000+ in seconds.",
  "Using HTTPS improves Google search ranking by up to 5 percent.",
  "A single-page application can reduce server requests by more than 50 percent.",
  "More than 70 percent of production outages are caused by deployment errors, not code bugs.",
  "Automated testing can catch over 85 percent of critical defects before release.",
  "Modern cloud providers achieve over 99.95 percent uptime using distributed systems.",
  "JWT authentication eliminates the need for server-side session storage in 100 percent stateless APIs.",
  "Load balancers can increase application availability by more than 99.9 percent.",
  "Using CDN can reduce page load time by up to 60 percent for global users.",
  "Database indexing can speed up queries by 10x to 100x in large datasets.",
  "A single API gateway can manage traffic for thousands of microservices.",
  "Cloud auto-scaling can reduce infrastructure cost by up to 40 percent."
];


export default function HomeLoader() {
const [seconds, setSeconds] = useState(60);
const [isReady, setIsReady] = useState(false);
  const [factIndex, setFactIndex] = useState(0);

 useEffect(() => {
  if (seconds <= 0) {
    setIsReady(true);
    return;
  }

  const timer = setInterval(() => {
    setSeconds((s) => s - 1);
  }, 1000);

  return () => clearInterval(timer);
}, [seconds]);


  useEffect(() => {
    const interval = setInterval(() => {
      setFactIndex((i) => (i + 1) % facts.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="render-loader">
      <h2>Starting Secure Backend</h2>

      <p className="render-info">
        Our backend is hosted on <b>Render Cloud</b>.  
        To optimize costs, Render automatically puts servers to sleep after
        10 minutes of inactivity.  
        When you visit again, the server needs about <b>30–60 seconds</b> to wake up.
      </p>

      <div className="timer">
  Backend is starting. Expected within <span>1 minute</span>
</div>
<div className="timer-sub">
  {seconds > 0
    ? `Usually takes ${seconds}–${seconds + 15} seconds`
    : "Connecting to server..."}
</div>




      <div className="progress-bar">
        <div
          className="progress"
          style={{ width: `${((60 - seconds) / 60) * 100}%` }}
        />
      </div>

      <div className="fact-box">
        <h4>Did you know?</h4>
        <p>{facts[factIndex]}</p>
      </div>

      <div className="render-footer">
        This ensures low hosting cost while maintaining production-grade security.
      </div>
    </div>
  );
}
