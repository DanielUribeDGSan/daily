// hooks/useRespuestas.js
import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";

const RESPUESTAS_PATH = "col-sala/daily/col-respuestas";

const useRespuestas = (preguntaId) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [respuestas, setRespuestas] = useState([]);

  useEffect(() => {
    if (!preguntaId) return;

    setLoading(true);

    try {
      const q = query(
        collection(db, RESPUESTAS_PATH),
        where("idPregunta", "==", preguntaId),
        orderBy("tiempoRespuesta", "asc")
      );

      // Establecer el listener
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const respuestasData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setRespuestas(respuestasData);
          setLoading(false);
        },
        (err) => {
          console.error("Error al escuchar respuestas:", err);
          setError(err);
          setLoading(false);
        }
      );

      // Limpiar el listener cuando el componente se desmonte
      return () => unsubscribe();
    } catch (err) {
      setError(err);
      console.error("Error al configurar listener de respuestas:", err);
      setLoading(false);
    }
  }, [preguntaId]);

  // Registrar respuesta de usuario
  const registrarRespuesta = async (respuestaData) => {
    setLoading(true);
    try {
      const nuevaRespuesta = {
        nombreUsuario: respuestaData.nombreUsuario,
        idUsuario: respuestaData.idUsuario,
        idPregunta: respuestaData.idPregunta,
        respuestaSeleccionada: respuestaData.respuestaSeleccionada,
        tiempoRespuesta: respuestaData.tiempoRespuesta,
        fechaRespuesta: new Date(),
        correcta: respuestaData.correcta || false,
      };

      const docRef = await addDoc(
        collection(db, RESPUESTAS_PATH),
        nuevaRespuesta
      );

      return {
        id: docRef.id,
        ...nuevaRespuesta,
      };
    } catch (err) {
      setError(err);
      console.error("Error al registrar respuesta:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Obtener respuestas por pregunta ordenadas por tiempo
  const obtenerRespuestasPorPregunta = (preguntaId, callback) => {
    try {
      const q = query(
        collection(db, RESPUESTAS_PATH),
        where("idPregunta", "==", preguntaId),
        orderBy("tiempoRespuesta", "asc")
      );

      return onSnapshot(q, (snapshot) => {
        const respuestas = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        callback(respuestas);
      });
    } catch (err) {
      setError(err);
      console.error("Error al obtener respuestas:", err);
      throw err;
    }
  };

  // Obtener respuestas de un usuario específico
  const obtenerRespuestasUsuario = (userId, callback) => {
    try {
      const q = query(
        collection(db, RESPUESTAS_PATH),
        where("idUsuario", "==", userId),
        orderBy("fechaRespuesta", "desc")
      );

      return onSnapshot(q, (snapshot) => {
        const respuestas = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        callback(respuestas);
      });
    } catch (err) {
      setError(err);
      console.error("Error al obtener respuestas del usuario:", err);
      throw err;
    }
  };

  // Obtener ranking de respuestas por pregunta
  const obtenerRankingPregunta = async (preguntaId) => {
    setLoading(true);
    try {
      const q = query(
        collection(db, RESPUESTAS_PATH),
        where("idPregunta", "==", preguntaId),
        where("correcta", "==", true),
        orderBy("tiempoRespuesta", "asc")
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc, index) => ({
        posicion: index + 1,
        id: doc.id,
        ...doc.data(),
      }));
    } catch (err) {
      setError(err);
      console.error("Error al obtener ranking:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar respuesta
  const eliminarRespuesta = async (respuestaId) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, RESPUESTAS_PATH, respuestaId));
    } catch (err) {
      setError(err);
      console.error("Error al eliminar respuesta:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Verificar si usuario ya respondió
  const verificarRespuestaUsuario = async (preguntaId, userId) => {
    setLoading(true);
    try {
      const q = query(
        collection(db, RESPUESTAS_PATH),
        where("idPregunta", "==", preguntaId),
        where("idUsuario", "==", userId)
      );

      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (err) {
      setError(err);
      console.error("Error al verificar respuesta:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    registrarRespuesta,
    obtenerRespuestasPorPregunta,
    obtenerRespuestasUsuario,
    obtenerRankingPregunta,
    eliminarRespuesta,
    verificarRespuestaUsuario,
    respuestas,
  };
};

export default useRespuestas;
