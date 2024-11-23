// scripts/registrarPreguntas.js

import { preguntas } from "data/questions";
import usePreguntas from "firebase-local/hooks/useQuestions";
import { useEffect, useState } from "react";

const RegistrarPreguntas = () => {
  const { crearPregunta } = usePreguntas();
  const [status, setStatus] = useState("");
  const [registradas, setRegistradas] = useState(0);

  useEffect(() => {
    const registrarPreguntas = async () => {
      for (const pregunta of preguntas) {
        try {
          await crearPregunta(pregunta);
          setRegistradas((prev) => prev + 1);
          console.log(`Pregunta registrada: ${pregunta.pregunta}`);
        } catch (error) {
          console.error(
            `Error al registrar pregunta: ${pregunta.pregunta}`,
            error
          );
        }
      }
      setStatus("Todas las preguntas han sido registradas");
    };

    registrarPreguntas();

    // Cleanup function
    return () => {
      setStatus("");
      setRegistradas(0);
    };
  }, []); // Se ejecuta solo una vez al montar el componente

  return (
    <div>
      <h2>Registrador de Preguntas</h2>
      <div>Progreso: {registradas} completadas</div>
      <div>Estado: {status}</div>
    </div>
  );
};

export default RegistrarPreguntas;
