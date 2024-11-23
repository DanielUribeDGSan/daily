// hooks/useUtilidades.js
import { useState, useEffect, useCallback } from "react";
import { doc, setDoc, updateDoc, onSnapshot, getDoc } from "firebase/firestore";
import { db } from "../firebase";

const UTILIDADES_PATH = "col-sala/daily/col-utilidades";
const UTILIDADES_DOC = "configuracion";

const useUtilidades = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [utilidades, setUtilidades] = useState(null);

  // Inicializar utilidades con valores por defecto
  const inicializarUtilidades = useCallback(async () => {
    setLoading(true);
    try {
      const configuracionInicial = {
        timerActivo: false,
        comenzarJuego: false,
        fechaActualizacion: new Date(),
      };

      await setDoc(
        doc(db, UTILIDADES_PATH, UTILIDADES_DOC),
        configuracionInicial
      );

      setUtilidades(configuracionInicial);
      return configuracionInicial;
    } catch (err) {
      setError(err);
      console.error("Error al inicializar utilidades:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Escuchar cambios en las utilidades
  useEffect(() => {
    const docRef = doc(db, UTILIDADES_PATH, UTILIDADES_DOC);

    // Verificar si existe el documento
    const checkDoc = async () => {
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        await inicializarUtilidades();
      }
    };

    checkDoc();

    // Suscribirse a cambios
    const unsubscribe = onSnapshot(
      docRef,
      (doc) => {
        if (doc.exists()) {
          setUtilidades(doc.data());
        }
      },
      (err) => {
        setError(err);
        console.error("Error al escuchar utilidades:", err);
      }
    );

    return () => unsubscribe();
  }, [inicializarUtilidades]);

  // Actualizar timer
  const actualizarTimer = async (estado) => {
    setLoading(true);
    try {
      const docRef = doc(db, UTILIDADES_PATH, UTILIDADES_DOC);
      await updateDoc(docRef, {
        timerActivo: estado,
        fechaActualizacion: new Date(),
      });
    } catch (err) {
      setError(err);
      console.error("Error al actualizar timer:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar estado del juego
  const actualizarEstadoJuego = async (estado) => {
    setLoading(true);
    try {
      const docRef = doc(db, UTILIDADES_PATH, UTILIDADES_DOC);
      await updateDoc(docRef, {
        comenzarJuego: estado,
        fechaActualizacion: new Date(),
      });
    } catch (err) {
      setError(err);
      console.error("Error al actualizar estado del juego:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar múltiples campos
  const actualizarUtilidades = async (nuevasUtilidades) => {
    setLoading(true);
    try {
      const docRef = doc(db, UTILIDADES_PATH, UTILIDADES_DOC);
      await updateDoc(docRef, {
        ...nuevasUtilidades,
        fechaActualizacion: new Date(),
      });
    } catch (err) {
      setError(err);
      console.error("Error al actualizar utilidades:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Reiniciar configuración
  const reiniciarUtilidades = async () => {
    setLoading(true);
    try {
      await inicializarUtilidades();
    } catch (err) {
      setError(err);
      console.error("Error al reiniciar utilidades:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    utilidades,
    loading,
    error,
    actualizarTimer,
    actualizarEstadoJuego,
    actualizarUtilidades,
    reiniciarUtilidades,
  };
};

export default useUtilidades;
