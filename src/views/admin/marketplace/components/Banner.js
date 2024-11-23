import React from "react";

// Chakra imports
import { Box, Button, Flex, Link, Spinner, Text } from "@chakra-ui/react";

// Assets
import useUtilidades from "firebase-local/hooks/useUtilidades";
import usePreguntas from "firebase-local/hooks/useQuestions";

export default function Banner() {
  const { actualizarEstadoJuego, actualizarTimer, utilidades } =
    useUtilidades();
  const { preguntaActiva, cambiarPreguntaActiva } = usePreguntas();
  // Chakra Color Mode

  const handleClick = () => {
    actualizarTimer(!utilidades?.timerActivo);
    if (!utilidades?.comenzarJuego) {
      actualizarEstadoJuego(!utilidades?.comenzarJuego);
    } else {
      if (!preguntaActiva) return;
      cambiarPreguntaActiva(preguntaActiva?.id);
    }
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
    >
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
        >
          {!utilidades?.comenzarJuego ? "Empezar juego" : "Continuar juego"}
        </Button>
      </Flex>
    </Flex>
  );
}
