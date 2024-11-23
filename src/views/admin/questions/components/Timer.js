// components/Timer.js
import { Box, Text } from "@chakra-ui/react";
import useGameTimer from "firebase-local/hooks/useGameTimer";
import useRespuestas from "firebase-local/hooks/useResponses";
import useUtilidades from "firebase-local/hooks/useUtilidades";
import React, { useEffect } from "react";

const Timer = (props) => {
  const { idQuestion } = props;
  const { respuestas } = useRespuestas(idQuestion);
  const { actualizarTimer } = useUtilidades();

  const { minutes, seconds, isRunning, pause } = useGameTimer();

  useEffect(() => {
    if (respuestas.length >= 2) {
      pause();
      actualizarTimer(false);
    }
  }, [respuestas]);

  if (!isRunning || respuestas.length >= 2) {
    return;
  }

  return (
    <Box
      display={"flex"}
      flex={1}
      alignItems="center"
      justifyContent="center"
      textAlign={"center"}
    >
      <Box
        px="0px"
        mb="20px"
        background={"white"}
        p={5}
        borderRadius={10}
        width={"auto"}
        display={"inline-flex"}
      >
        <Box>
          <Box style={{ fontSize: "24px" }}>
            <Text>¡Comenzó el tiempo!</Text>
            <span>{minutes}</span>:
            <span>{seconds < 10 ? `0${seconds}` : seconds}</span>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Timer;
