// hooks/useGameTimer.js
import { useState, useEffect } from "react";
import { useTimer } from "react-timer-hook";
import useUtilidades from "firebase-local/hooks/useUtilidades";

const TIMER_DURATION = 30; // duración en segundos

const useGameTimer = () => {
  const { actualizarTimer, utilidades } = useUtilidades();
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState(0);

  const [expiryTimestamp, setExpiryTimestamp] = useState(() => {
    const time = new Date();
    time.setSeconds(time.getSeconds() + TIMER_DURATION);
    return time;
  });

  const { seconds, minutes, isRunning, start, pause, restart } = useTimer({
    expiryTimestamp,
    onExpire: () => {
      actualizarTimer(false);
    },
    autoStart: false,
  });

  useEffect(() => {
    if (!utilidades) return;

    if (utilidades.timerActivo) {
      const newTime = new Date();
      newTime.setSeconds(newTime.getSeconds() + TIMER_DURATION);
      setExpiryTimestamp(newTime);
      restart(newTime);
      start();
      setTiempoTranscurrido(0); // Reiniciar tiempo transcurrido
    } else {
      pause();
    }
  }, [utilidades?.timerActivo]);

  // Calcular tiempo transcurrido
  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        setTiempoTranscurrido((prev) => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isRunning]);

  const getTiempoRestante = () => {
    return minutes * 60 + seconds;
  };

  const getTiempoTranscurrido = () => {
    return tiempoTranscurrido;
  };

  const formatTime = (time) => {
    const mins = Math.floor(time / 60);
    const secs = time % 60;
    return `${mins}:${secs < 10 ? `0${secs}` : secs}`;
  };

  return {
    seconds,
    minutes,
    isRunning,
    tiempoTranscurrido,
    getTiempoRestante,
    getTiempoTranscurrido,
    formatTime,
    timerActivo: utilidades?.timerActivo,
    pause,
  };
};

export default useGameTimer;
