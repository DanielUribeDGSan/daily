import { useState, useEffect } from "react";
import {
  doc,
  onSnapshot,
  setDoc,
  getDoc,
  deleteDoc,
  increment,
} from "firebase/firestore";
import { db } from "../firebase"; // Ajusta la ruta según tu estructura

const COUNTER_DOC_ID = "counter";
const COUNTER_PATH = "col-sala/daily/col-preguntas-jugadas";

const useQuestionsCounter = () => {
  const [counter, setCounter] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Suscripción en tiempo real al contador
  useEffect(() => {
    const counterRef = doc(db, COUNTER_PATH, COUNTER_DOC_ID);

    const unsubscribe = onSnapshot(
      counterRef,
      (doc) => {
        if (doc.exists()) {
          setCounter(doc.data().count || 0);
        } else {
          setCounter(1);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Error al suscribirse al contador:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Inicializar el contador
  const initializeCounter = async () => {
    setUpdating(true);
    setError(null);

    try {
      const counterRef = doc(db, COUNTER_PATH, COUNTER_DOC_ID);
      await setDoc(counterRef, {
        count: 1,
        lastUpdated: new Date().toISOString(),
      });
      return true;
    } catch (err) {
      console.error("Error al inicializar contador:", err);
      setError(err);
      return false;
    } finally {
      setUpdating(false);
    }
  };

  // Obtener el valor actual del contador (sin suscripción)
  const getCurrentCount = async () => {
    try {
      const counterRef = doc(db, COUNTER_PATH, COUNTER_DOC_ID);
      const docSnap = await getDoc(counterRef);

      if (docSnap.exists()) {
        return docSnap.data().count || 0;
      }
      return 1;
    } catch (err) {
      console.error("Error al obtener contador:", err);
      setError(err);
      return 1;
    }
  };

  // Incrementar el contador
  const incrementCounter = async () => {
    setUpdating(true);
    setError(null);

    try {
      const counterRef = doc(db, COUNTER_PATH, COUNTER_DOC_ID);
      const currentCount = await getCurrentCount();

      // Si ya llegamos a 3, no incrementamos más
      if (currentCount >= 3) {
        return {
          success: true,
          isMaxReached: true,
          count: currentCount,
        };
      }

      const newCount = currentCount + 1;

      await setDoc(
        counterRef,
        {
          count: newCount,
          lastUpdated: new Date().toISOString(),
        },
        { merge: true }
      );

      return {
        success: true,
        isMaxReached: newCount >= 3,
        count: newCount,
      };
    } catch (err) {
      console.error("Error al incrementar contador:", err);
      setError(err);
      return {
        success: false,
        error: err.message,
      };
    } finally {
      setUpdating(false);
    }
  };

  // Resetear el contador a cero
  const resetCounter = async () => {
    setUpdating(true);
    setError(null);

    try {
      const counterRef = doc(db, COUNTER_PATH, COUNTER_DOC_ID);
      await setDoc(
        counterRef,
        {
          count: 1,
          lastUpdated: new Date().toISOString(),
        },
        { merge: true }
      );
      return true;
    } catch (err) {
      console.error("Error al resetear contador:", err);
      setError(err);
      return false;
    } finally {
      setUpdating(false);
    }
  };

  // Eliminar el contador completamente
  const deleteCounter = async () => {
    setUpdating(true);
    setError(null);

    try {
      const counterRef = doc(db, COUNTER_PATH, COUNTER_DOC_ID);
      await deleteDoc(counterRef);
      return true;
    } catch (err) {
      console.error("Error al eliminar contador:", err);
      setError(err);
      return false;
    } finally {
      setUpdating(false);
    }
  };

  return {
    counter, // Valor actual del contador en tiempo real
    loading, // Estado de carga inicial
    error, // Error si ocurre alguno
    updating, // Indica si hay una operación en curso
    getCurrentCount, // Obtener valor actual (sin suscripción)
    incrementCounter, // Incrementar el contador
    resetCounter, // Resetear a cero
    deleteCounter, // Eliminar el documento
    initializeCounter, // Crear/inicializar el contador
  };
};

export default useQuestionsCounter;
