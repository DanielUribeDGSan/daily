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
        unsubscribe = onSnapshot(
          collection(db, "col-sala/daily/col-usuarios-activos"),
          (snapshot) => {
            const activeUsersData = snapshot.docs.map((doc) => ({
              ...doc.data(),
              id: doc.id,
            }));
            setActiveUsers(activeUsersData);
            setLoading(false);
          },
          (err) => {
            setError(err);
            setLoading(false);
            console.error("Error en la suscripción a usuarios activos:", err);
          }
        );
      } catch (err) {
        setError(err);
        setLoading(false);
        console.error("Error al iniciar suscripción a usuarios activos:", err);
      }
    };

    subscribeToActiveUsers();

    return () => unsubscribe();
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

      console.log("activeUsersSnapshot", activeUsersSnapshot);

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

  return {
    activeUsers,
    loading,
    error,
    registering,
    findActiveUserById,
    registerActiveUser,
    removeActiveUser,
    removeAllActiveUsersAndMarkAsPlayed,
  };
};

export default useActiveUsers;
