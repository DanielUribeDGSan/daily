import { useState, useEffect } from "react";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase"; // Ajusta la ruta según tu estructura

const useActiveUsers = () => {
  const [activeUsers, setActiveUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registering, setRegistering] = useState(false);

  // Suscripción a usuarios activos en tiempo real
  useEffect(() => {
    let unsubscribe = () => {};

    const subscribeToActiveUsers = async () => {
      try {
        // Crear la referencia a la colección
        const activeUsersRef = collection(
          db,
          "col-sala/daily/col-usuarios-activos"
        );

        unsubscribe = onSnapshot(
          activeUsersRef,
          (snapshot) => {
            const activeUsersData = snapshot.docs.map((doc) => {
              const data = doc.data();
              return {
                ...data,
                id: doc.id,
                userId: data.userId || doc.id, // Asegurarnos de tener siempre userId
              };
            });

            // Log para debugging
            console.log("Active Users Updated:", {
              count: activeUsersData.length,
              users: activeUsersData.map((user) => ({
                id: user.id,
                userId: user.userId,
                nombre: user.nombre,
              })),
            });

            setActiveUsers(activeUsersData);
            setLoading(false);
          },
          (error) => {
            console.error("Error en la suscripción:", error);
            setError(error);
            setLoading(false);
          }
        );
      } catch (err) {
        console.error("Error al iniciar suscripción:", err);
        setError(err);
        setLoading(false);
      }
    };

    // Iniciar suscripción
    subscribeToActiveUsers();

    // Cleanup
    return () => {
      unsubscribe();
      console.log("Subscription cleaned up");
    };
  }, []);

  // Buscar un usuario activo por ID
  const findActiveUserById = async (userId) => {
    try {
      const activeUserRef = doc(
        db,
        "col-sala/daily/col-usuarios-activos",
        userId
      );
      const snapshot = await getDocs(
        query(
          collection(db, "col-sala/daily/col-usuarios-activos"),
          where("userId", "==", userId)
        )
      );

      if (!snapshot.empty) {
        const userData = snapshot.docs[0].data();
        return { ...userData, id: snapshot.docs[0].id };
      }
      return null;
    } catch (err) {
      console.error("Error al buscar usuario activo:", err);
      setError(err);
      return null;
    }
  };

  // Registrar un usuario como activo
  const registerActiveUser = async (userId, additionalData = {}) => {
    setRegistering(true);
    setError(null);

    try {
      const activeUserRef = doc(
        db,
        "col-sala/daily/col-usuarios-activos",
        userId
      );
      await setDoc(activeUserRef, {
        userId,
        timestamp: new Date().toISOString(),
        ...additionalData,
      });
      return true;
    } catch (err) {
      console.error("Error al registrar usuario activo:", err);
      setError(err);
      return false;
    } finally {
      setRegistering(false);
    }
  };

  // Remover un usuario de los activos
  const removeActiveUser = async (userId) => {
    try {
      const activeUserRef = doc(
        db,
        "col-sala/daily/col-usuarios-activos",
        userId
      );
      await deleteDoc(activeUserRef);
      return true;
    } catch (err) {
      console.error("Error al remover usuario activo:", err);
      setError(err);
      return false;
    }
  };

  const removeAllActiveUsersAndMarkAsPlayed = async () => {
    const batch = writeBatch(db);

    try {
      // 1. Obtener todos los usuarios activos
      const activeUsersSnapshot = await getDocs(
        collection(db, "col-sala/daily/col-usuarios-activos")
      );

      // 2. Para cada usuario activo:
      const updatePromises = activeUsersSnapshot.docs.map(
        async (docSnapshot) => {
          const userData = docSnapshot.data();
          const userId = userData.userId || docSnapshot.id;

          // 2.1 Agregar la eliminación del documento de usuarios activos al batch
          const activeUserRef = doc(
            db,
            "col-sala/daily/col-usuarios-activos",
            docSnapshot.id
          );
          batch.delete(activeUserRef);

          // 2.2 Actualizar el documento en col-usuarios
          const userRef = doc(db, "col-sala/daily/col-usuarios", userId);
          return updateDoc(userRef, {
            alreadyPlayed: true,
            lastPlayed: new Date().toISOString(),
          });
        }
      );

      // 3. Ejecutar todas las actualizaciones de col-usuarios
      await Promise.all(updatePromises);

      // 4. Commit del batch para eliminar todos los usuarios activos
      await batch.commit();

      return {
        success: true,
        usersProcessed: activeUsersSnapshot.size,
      };
    } catch (err) {
      console.error(
        "Error al eliminar usuarios activos y marcarlos como jugados:",
        err
      );
      setError(err);
      return {
        success: false,
        error: err.message,
      };
    }
  };

  const removeAllActiveUsersAndMarkAsPlayedReset = async () => {
    const batch = writeBatch(db);

    try {
      // 1. Obtener todos los usuarios activos
      const activeUsersSnapshot = await getDocs(
        collection(db, "col-sala/daily/col-usuarios-activos")
      );

      // 2. Para cada usuario activo:
      const updatePromises = activeUsersSnapshot.docs.map(
        async (docSnapshot) => {
          const userData = docSnapshot.data();
          const userId = userData.userId || docSnapshot.id;

          // 2.1 Agregar la eliminación del documento de usuarios activos al batch
          const activeUserRef = doc(
            db,
            "col-sala/daily/col-usuarios-activos",
            docSnapshot.id
          );
          batch.delete(activeUserRef);

          // 2.2 Actualizar el documento en col-usuarios
          const userRef = doc(db, "col-sala/daily/col-usuarios", userId);
          return updateDoc(userRef, {
            alreadyPlayed: false,
            lastPlayed: new Date().toISOString(),
          });
        }
      );

      // 3. Ejecutar todas las actualizaciones de col-usuarios
      await Promise.all(updatePromises);

      // 4. Commit del batch para eliminar todos los usuarios activos
      await batch.commit();

      return {
        success: true,
        usersProcessed: activeUsersSnapshot.size,
      };
    } catch (err) {
      console.error(
        "Error al eliminar usuarios activos y marcarlos como jugados:",
        err
      );
      setError(err);
      return {
        success: false,
        error: err.message,
      };
    }
  };

  const isUserActive = (userId) => {
    if (!userId || !activeUsers.length) return false;
    return activeUsers.some(
      (user) => user.userId === userId || user.id === userId
    );
  };

  return {
    activeUsers,
    loading,
    error,
    registering,
    findActiveUserById,
    registerActiveUser,
    removeActiveUser,
    removeAllActiveUsersAndMarkAsPlayed,
    isUserActive, // Exportamos la función helper
    removeAllActiveUsersAndMarkAsPlayedReset,
  };
};

export default useActiveUsers;
