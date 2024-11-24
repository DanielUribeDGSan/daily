// hooks/useUser.js
import { useState, useEffect } from "react";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../firebase"; // Ajusta la ruta según tu estructura

const useUser = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    let unsubscribeUsers = () => {};

    const subscribeToAllUsers = async () => {
      try {
        // Suscribirse a la colección de usuarios
        unsubscribeUsers = onSnapshot(
          collection(db, "col-sala/daily/col-usuarios"),
          (snapshot) => {
            const usersData = snapshot.docs.map((doc) => ({
              ...doc.data(),
              id: doc.id,
            }));
            setAllUsers(usersData);
            setLoadingUsers(false);
          },
          (err) => {
            setError(err);
            setLoadingUsers(false);
            console.error("Error en la suscripción a usuarios:", err);
          }
        );
      } catch (err) {
        setError(err);
        setLoadingUsers(false);
        console.error("Error al iniciar suscripción a usuarios:", err);
      }
    };

    subscribeToAllUsers();

    // Cleanup
    return () => unsubscribeUsers();
  }, []);

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

  const updateUser = async (updatedData) => {
    setUpdating(true);
    setError(null);

    try {
      if (!user?.id) {
        throw new Error("No hay usuario para actualizar");
      }

      const userRef = doc(db, "col-sala/daily/col-usuarios", user.id);

      // Remover el campo id si existe en updatedData
      const { id, ...dataToUpdate } = updatedData;

      await updateDoc(userRef, dataToUpdate);

      // Actualizar localStorage si es necesario
      const userLocal = localStorage.getItem("userEsencial");
      if (userLocal) {
        const currentUserData = JSON.parse(userLocal);
        localStorage.setItem(
          "userEsencial",
          JSON.stringify({
            ...currentUserData,
            ...dataToUpdate,
          })
        );
      }

      return true;
    } catch (err) {
      setError(err);
      console.error("Error al actualizar usuario:", err);
      return false;
    } finally {
      setUpdating(false);
    }
  };

  // Función para limpiar datos del usuario
  const clearUser = () => {
    localStorage.removeItem("userEsencial");
    setUser(null);
  };

  return {
    user,
    loading,
    error,
    clearUser,
    allUsers,
    loadingUsers,
    updating,
    updateUser,
  };
};

export default useUser;
