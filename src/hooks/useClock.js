import { useState, useEffect } from 'react';
import { getGreeting, getTodayDate } from '../utils/formatters';

export const useClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');

  return {
    timeString: `${hours}:${minutes}:${seconds}`,
    dateString: getTodayDate(),
    greeting: getGreeting() // this evaluates getGreeting() every render, so it stays up-to-date
  };
};
