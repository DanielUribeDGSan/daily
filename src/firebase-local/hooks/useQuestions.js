// hooks/usePreguntas.js
import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  query,
  where,
  onSnapshot,
  writeBatch,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";

const PREGUNTAS_PATH = "col-sala/daily/col-preguntas";

const usePreguntas = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [preguntaActiva, setPreguntaActiva] = useState(null);

  useEffect(() => {
    const q = query(
      collection(db, PREGUNTAS_PATH),
      where("activa", "==", true)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        // Como solo debería haber una pregunta activa, tomamos la primera
        if (!snapshot.empty) {
          const preguntaData = snapshot.docs[0].data();
          setPreguntaActiva({
            id: snapshot.docs[0].id,
            ...preguntaData,
          });
        } else {
          setPreguntaActiva(null);
        }
      },
      (err) => {
        setError(err);
        console.error("Error al escuchar preguntas activas:", err);
      }
    );

    // Limpiar suscripción cuando se desmonte el componente
    return () => unsubscribe();
  }, []);

  // Crear nueva pregunta
  const crearPregunta = async (preguntaData) => {
    setLoading(true);
    try {
      // Validar que haya al menos una respuesta correcta
      if (!preguntaData.respuestas || preguntaData.respuestas.length < 2) {
        throw new Error("Se requieren al menos dos respuestas");
      }

      const tieneRespuestaCorrecta = preguntaData.respuestas.some(
        (resp) => resp.correcta
      );

      if (!tieneRespuestaCorrecta) {
        throw new Error("Debe haber al menos una respuesta correcta");
      }

      const nuevaPregunta = {
        pregunta: preguntaData.pregunta,
        activa: false,
        jugadores: [],
        fechaCreacion: new Date(),
        respuestas: preguntaData.respuestas.map((resp) => ({
          respuesta: resp.respuesta,
          correcta: resp.correcta,
        })),
        show: false,
      };

      const docRef = await addDoc(
        collection(db, PREGUNTAS_PATH),
        nuevaPregunta
      );

      return {
        id: docRef.id,
        ...nuevaPregunta,
      };
    } catch (err) {
      setError(err);
      console.error("Error al crear pregunta:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Añadir respuesta a una pregunta
  const agregarRespuesta = async (preguntaId, respuestaData) => {
    setLoading(true);
    try {
      const docRef = doc(db, PREGUNTAS_PATH, preguntaId);
      await updateDoc(docRef, {
        respuestas: arrayUnion({
          respuesta: respuestaData.respuesta,
          correcta: respuestaData.correcta || false,
        }),
      });
    } catch (err) {
      setError(err);
      console.error("Error al agregar respuesta:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Quitar respuesta de una pregunta
  const quitarRespuesta = async (preguntaId, respuestaIndex) => {
    setLoading(true);
    try {
      const docRef = doc(db, PREGUNTAS_PATH, preguntaId);
      // Primero obtenemos las respuestas actuales
      const preguntaDoc = await docRef.get();
      const respuestas = preguntaDoc.data().respuestas;

      // Eliminamos la respuesta en el índice especificado
      respuestas.splice(respuestaIndex, 1);

      // Actualizamos el documento con el nuevo array de respuestas
      await updateDoc(docRef, {
        respuestas: respuestas,
      });
    } catch (err) {
      setError(err);
      console.error("Error al quitar respuesta:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar respuesta
  const actualizarRespuesta = async (
    preguntaId,
    respuestaIndex,
    nuevaRespuesta
  ) => {
    setLoading(true);
    try {
      const docRef = doc(db, PREGUNTAS_PATH, preguntaId);
      // Primero obtenemos las respuestas actuales
      const preguntaDoc = await docRef.get();
      const respuestas = preguntaDoc.data().respuestas;

      // Actualizamos la respuesta en el índice especificado
      respuestas[respuestaIndex] = {
        respuesta: nuevaRespuesta.respuesta,
        correcta: nuevaRespuesta.correcta,
      };

      // Actualizamos el documento con el array modificado
      await updateDoc(docRef, {
        respuestas: respuestas,
      });
    } catch (err) {
      setError(err);
      console.error("Error al actualizar respuesta:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Marcar respuesta como correcta
  const marcarRespuestaCorrecta = async (preguntaId, respuestaIndex) => {
    setLoading(true);
    try {
      const docRef = doc(db, PREGUNTAS_PATH, preguntaId);
      // Primero obtenemos las respuestas actuales
      const preguntaDoc = await docRef.get();
      const respuestas = preguntaDoc.data().respuestas;

      // Actualizamos todas las respuestas como incorrectas excepto la seleccionada
      const nuevasRespuestas = respuestas.map((resp, index) => ({
        ...resp,
        correcta: index === respuestaIndex,
      }));

      // Actualizamos el documento
      await updateDoc(docRef, {
        respuestas: nuevasRespuestas,
      });
    } catch (err) {
      setError(err);
      console.error("Error al marcar respuesta correcta:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Añadir jugador a una pregunta
  const agregarJugador = async (preguntaId, jugadorId) => {
    setLoading(true);
    try {
      const docRef = doc(db, PREGUNTAS_PATH, preguntaId);
      await updateDoc(docRef, {
        jugadores: arrayUnion(jugadorId),
      });
    } catch (err) {
      setError(err);
      console.error("Error al agregar jugador:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Quitar jugador de una pregunta
  const quitarJugador = async (preguntaId, jugadorId) => {
    setLoading(true);
    try {
      const docRef = doc(db, PREGUNTAS_PATH, preguntaId);
      await updateDoc(docRef, {
        jugadores: arrayRemove(jugadorId),
      });
    } catch (err) {
      setError(err);
      console.error("Error al quitar jugador:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Activar/Desactivar pregunta
  const togglePreguntaActiva = async (preguntaId, estado) => {
    setLoading(true);
    try {
      const docRef = doc(db, PREGUNTAS_PATH, preguntaId);
      await updateDoc(docRef, {
        activa: estado,
      });
    } catch (err) {
      setError(err);
      console.error("Error al cambiar estado:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar pregunta
  const eliminarPregunta = async (preguntaId) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, PREGUNTAS_PATH, preguntaId));
    } catch (err) {
      setError(err);
      console.error("Error al eliminar pregunta:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cambiarPreguntaActiva = async (preguntaIdActual) => {
    setLoading(true);
    try {
      // 1. Primero obtener todas las preguntas inactivas
      const q = query(
        collection(db, PREGUNTAS_PATH),
        where("activa", "==", false),
        where("show", "==", false)
      );

      const querySnapshot = await getDocs(q);
      const preguntasInactivas = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (preguntasInactivas.length === 0) {
        throw new Error("No hay más preguntas disponibles");
      }

      // 2. Seleccionar una pregunta al azar
      const preguntaAleatoria =
        preguntasInactivas[
          Math.floor(Math.random() * preguntasInactivas.length)
        ];

      // 3. Ejecutar las actualizaciones en un batch para asegurar atomicidad
      const batch = writeBatch(db);

      // Desactivar la pregunta actual
      const preguntaActualRef = doc(db, PREGUNTAS_PATH, preguntaIdActual);
      batch.update(preguntaActualRef, {
        activa: false,
        show: true,
        jugadores: [], // Limpiar jugadores de la pregunta anterior
      });

      // Activar la nueva pregunta
      const nuevaPreguntaRef = doc(db, PREGUNTAS_PATH, preguntaAleatoria.id);
      batch.update(nuevaPreguntaRef, {
        activa: true,
        show: false,
        jugadores: [], // Iniciar con array vacío de jugadores
      });

      // Ejecutar el batch
      await batch.commit();

      return preguntaAleatoria.id;
    } catch (err) {
      setError(err);
      console.error("Error al cambiar pregunta activa:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    crearPregunta,
    agregarJugador,
    quitarJugador,
    togglePreguntaActiva,
    eliminarPregunta,
    agregarRespuesta,
    quitarRespuesta,
    actualizarRespuesta,
    marcarRespuestaCorrecta,
    preguntaActiva,
    cambiarPreguntaActiva,
  };
};

export default usePreguntas;
