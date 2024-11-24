import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Flex,
  Button,
  useDisclosure,
  useColorModeValue,
  Text,
  FormControl,
  FormLabel,
  Input,
  Spinner,
  Toast,
} from "@chakra-ui/react";
import { db } from "firebase-local/firebase";
import useUser from "firebase-local/hooks/useUser";
import { addDoc, collection } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";

function AlertDialogExample() {
  const { user, loading } = useUser();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();
  const [nombre, setNombre] = useState(""); // Estado para el nombre
  const [isLoading, setIsLoading] = useState(false); // Estado para el loading del botón

  const textColor = useColorModeValue("navy.700", "white");
  const brandStars = useColorModeValue("brand.500", "brand.400");

  useEffect(() => {
    const userEsencial = localStorage.getItem("userEsencial");
    if (!userEsencial) {
      onOpen();
    } else {
      console.log("user", user);
    }
    return () => {};
  }, [loading]);

  const handleRegistro = async () => {
    if (!nombre.trim()) {
      // Validar que el nombre no esté vacío

      Toast({
        title: "Por favor ingresa un nombre",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      // Crear el documento en Firestore
      const docRef = await addDoc(
        collection(db, "col-sala/daily/col-usuarios"),
        {
          nombre: nombre,
          fechaCreacion: new Date(),
          activo: true,
          puntos: 0,
          type: "jugador",
          daily: false,
          time: 0,
          // Puedes añadir más campos si los necesitas
        }
      );

      // Guardar en localStorage
      const userData = {
        id: docRef.id,
        nombre: nombre,
      };
      localStorage.setItem("userEsencial", JSON.stringify(userData));

      // Cerrar el modal
      onClose();
    } catch (error) {
      console.error("Error al registrar usuario:", error);
      alert("Error al registrar usuario");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Registro de Jugador
            </AlertDialogHeader>

            <AlertDialogBody>
              <Flex
                maxW={{ base: "100%", md: "max-content" }}
                w="100%"
                mx={{ base: "auto", lg: "0px" }}
                me="auto"
                h="100%"
                alignItems="start"
                justifyContent="center"
                mb={{ base: "30px", md: "60px" }}
                px={{ base: "25px", md: "0px" }}
                flexDirection="column"
              >
                <Flex
                  zIndex="2"
                  direction="column"
                  w={{ base: "100%", md: "420px" }}
                  maxW="100%"
                  background="transparent"
                  borderRadius="15px"
                  mx={{ base: "auto", lg: "unset" }}
                  me="auto"
                  mb={{ base: "20px", md: "auto" }}
                >
                  <Flex align="center" mb="25px"></Flex>
                  <FormControl>
                    <FormLabel
                      display="flex"
                      ms="4px"
                      fontSize="sm"
                      fontWeight="500"
                      color={textColor}
                      mb="8px"
                    >
                      Nombre<Text color={brandStars}>*</Text>
                    </FormLabel>
                    <Input
                      isRequired={true}
                      variant="auth"
                      fontSize="sm"
                      ms={{ base: "0px", md: "0px" }}
                      type="text"
                      placeholder="Ejemplo: Daniel Uribe"
                      mb="24px"
                      fontWeight="500"
                      size="lg"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                    />

                    <Flex
                      justifyContent="space-between"
                      align="center"
                      mb="24px"
                    ></Flex>
                    <Button
                      fontSize="sm"
                      variant="brand"
                      fontWeight="500"
                      w="100%"
                      h="50"
                      mb="24px"
                      onClick={handleRegistro}
                      isLoading={isLoading}
                      loadingText="Registrando..."
                    >
                      Jugar
                    </Button>
                  </FormControl>
                </Flex>
              </Flex>
            </AlertDialogBody>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}

export default AlertDialogExample;
