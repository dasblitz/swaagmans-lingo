import { useEffect, useState } from "react";

export function CountDown() {
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((state) => (state - 1 < 0 ? 0 : state - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return <p>Tijd: {timeLeft}</p>;
}
