// hooks/useQuestionTimer.js
import { useTimer } from "react-timer-hook";
import useRespuestas from "./useRespuestas";

const useQuestionTimer = (preguntaId, userId, tiempoLimite = 30) => {
  const { registrarRespuesta } = useRespuestas();

  // Crear timestamp para el timer
  const time = new Date();
  time.setSeconds(time.getSeconds() + tiempoLimite);

  const { seconds, minutes, isRunning, pause, restart } = useTimer({
    expiryTimestamp: time,
    onExpire: () => {
      // Manejar tiempo expirado
      console.log("Tiempo agotado");
    },
  });

  const handleRespuesta = async (respuestaData) => {
    if (!isRunning) return;

    const tiempoTranscurrido = minutes * 60 + seconds;

    try {
      await registrarRespuesta({
        ...respuestaData,
        idPregunta: preguntaId,
        idUsuario: userId,
        tiempoRespuesta: tiempoLimite - tiempoTranscurrido, // Tiempo que tardó en responder
      });

      pause();
      return true;
    } catch (error) {
      console.error("Error al registrar respuesta:", error);
      return false;
    }
  };

  return {
    seconds,
    minutes,
    isRunning,
    handleRespuesta,
    restart,
    tiempoTranscurrido: tiempoLimite - (minutes * 60 + seconds),
  };
};

export default useQuestionTimer;
