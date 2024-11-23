// hooks/useUser.js
import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase"; // Ajusta la ruta según tu estructura

const useUser = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubscribe = () => {};

    const subscribeToUser = async () => {
      try {
        // Verificar localStorage
        const userLocal = localStorage.getItem("userEsencial");
        if (!userLocal) {
          setLoading(false);
          return;
        }

        const userData = JSON.parse(userLocal);

        // Suscribirse a los cambios del documento
        unsubscribe = onSnapshot(
          doc(db, "col-sala/daily/col-usuarios", userData.id),
          (doc) => {
            if (doc.exists()) {
              setUser({
                ...doc.data(),
                id: doc.id,
              });
            } else {
              // Si no existe en Firebase, limpiar localStorage
              localStorage.removeItem("userEsencial");
              setUser(null);
            }
            setLoading(false);
          },
          (err) => {
            setError(err);
            setLoading(false);
            console.error("Error en la suscripción:", err);
          }
        );
      } catch (err) {
        setError(err);
        setLoading(false);
        console.error("Error al iniciar suscripción:", err);
      }
    };

    subscribeToUser();

    // Cleanup: desuscribirse cuando el componente se desmonte
    return () => unsubscribe();
  }, []);

  // Función para limpiar datos del usuario
  const clearUser = () => {
    localStorage.removeItem("userEsencial");
    setUser(null);
  };

  return {
    user, // Datos del usuario en tiempo real
    loading, // Estado de carga
    error, // Error si existe
    clearUser, // Función para limpiar datos
  };
};

export default useUser;
