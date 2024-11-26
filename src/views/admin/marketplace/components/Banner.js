import React, { useState } from "react";

// Chakra imports
import {
  Box,
  Button,
  Flex,
  Icon,
  Link,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";

// Assets
import useUtilidades from "firebase-local/hooks/useUtilidades";
import usePreguntas from "firebase-local/hooks/useQuestions";
import useQuestionsCounter from "firebase-local/hooks/useQuesrionsGame";
import useActiveUsers from "firebase-local/hooks/useActiveUser";
import { GrPowerReset } from "react-icons/gr";
import useRespuestas from "firebase-local/hooks/useResponses";
import useGameTimer from "firebase-local/hooks/useGameTimer";

export default function Banner() {
  const { actualizarEstadoJuego, actualizarTimer, utilidades } =
    useUtilidades();
  const { preguntaActiva, cambiarPreguntaActiva } = usePreguntas();
  const { getCurrentCount, incrementCounter, resetCounter, counter } =
    useQuestionsCounter();
  const [loading, setLoading] = useState();
  const [loadingReset, setLoadingReset] = useState();
  const {
    removeAllActiveUsersAndMarkAsPlayed,
    activeUsers,
    removeAllActiveUsersAndMarkAsPlayedReset,
  } = useActiveUsers();
  const { limpiarRespuestas } = useRespuestas();
  const { minutes, seconds, isRunning, pause } = useGameTimer();

  const toast = useToast();

  // Chakra Color Mode

  const handleClickReset = async () => {
    setLoadingReset(true);
    await pause();
    await actualizarTimer(false);
    await resetCounter();
    await limpiarRespuestas();
    await removeAllActiveUsersAndMarkAsPlayedReset();
    await actualizarEstadoJuego(false);
    await cambiarPreguntaActiva(preguntaActiva?.id);
    setLoadingReset(false);
  };

  const handleClick = async () => {
    console.log("activeUsers", activeUsers);

    if (activeUsers?.length <= 1) {
      console.log("entro");

      toast({
        title: "No hay usuarios activos",
        description: "Necesitas añadir al menos dos usuarios para jugar",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setLoading(true);
    const getCurrentCountData = await getCurrentCount();

    if (getCurrentCountData === 3) {
      await pause();
      await actualizarTimer(false);
      await resetCounter();
      await limpiarRespuestas();
      await removeAllActiveUsersAndMarkAsPlayed();
      await actualizarEstadoJuego(false);
      await cambiarPreguntaActiva(preguntaActiva?.id);
      setLoading(false);
      return;
    }

    await actualizarTimer(!utilidades?.timerActivo);

    if (!utilidades?.comenzarJuego) {
      await actualizarEstadoJuego(!utilidades?.comenzarJuego);
    } else {
      if (!preguntaActiva) return;
      await cambiarPreguntaActiva(preguntaActiva?.id);
      await limpiarRespuestas();
      await incrementCounter();
    }
    setLoading(false);
  };

  return (
    <Flex
      direction="column"
      background={"linear-gradient(to right, #422afb, #422afbd9, #422afbcc)"}
      mb="20px"
      bgSize="cover"
      py={{ base: "30px", md: "56px" }}
      px={{ base: "30px", md: "64px" }}
      borderRadius="30px"
      position={"relative"}
    >
      <Box flex={1} align="end" justify="end">
        <Button
          bg="white"
          color="black"
          _hover={{ bg: "whiteAlpha.900" }}
          _active={{ bg: "white" }}
          _focus={{ bg: "white" }}
          fontWeight="500"
          fontSize="14px"
          p={2}
          onClick={handleClickReset}
          isLoading={loadingReset}
          position={"absolute"}
          top={2}
          right={2}
        >
          <Icon as={GrPowerReset} width="20px" height="20px" color="inherit" />
        </Button>
      </Box>
      {!preguntaActiva && utilidades?.comenzarJuego && (
        <Box flex={1} align="center" justify="center">
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="blue.500"
            size="xl"
          />
        </Box>
      )}

      <Text
        fontSize={{ base: "24px", md: "34px" }}
        color="white"
        mb="14px"
        maxW={{
          base: "100%",
          md: "100%",
          lg: "100%",
          xl: "100%",
          "2xl": "100%",
          "3xl": "100%",
        }}
        fontWeight="700"
        lineHeight={{ base: "32px", md: "42px" }}
      >
        {utilidades?.comenzarJuego
          ? preguntaActiva?.pregunta
          : "Juego de preguntas"}
      </Text>

      <Flex align="center">
        <Button
          bg="white"
          color="black"
          _hover={{ bg: "whiteAlpha.900" }}
          _active={{ bg: "white" }}
          _focus={{ bg: "white" }}
          fontWeight="500"
          fontSize="14px"
          py="20px"
          px="27"
          me="38px"
          onClick={handleClick}
          isLoading={loading}
        >
          {!utilidades?.comenzarJuego
            ? "Empezar juego"
            : counter === 3
            ? "Reiniciar juego"
            : "Siguiente pregunta"}
        </Button>
      </Flex>
    </Flex>
  );
}
