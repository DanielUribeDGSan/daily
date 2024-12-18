import { useState } from "react";
import {
  Box,
  Button,
  Radio,
  RadioGroup,
  Spinner,
  Stack,
  Text,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import useGameTimer from "firebase-local/hooks/useGameTimer";
import usePreguntas from "firebase-local/hooks/useQuestions";
import useRespuestas from "firebase-local/hooks/useResponses";
import useUser from "firebase-local/hooks/useUser";
import useActiveUsers from "firebase-local/hooks/useActiveUser";
import useQuestionsCounter from "firebase-local/hooks/useQuesrionsGame";

const FormQuestions = ({ idQuestion }) => {
  // Estado para la respuesta seleccionada
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const { getTiempoTranscurrido, isRunning } = useGameTimer();
  const { preguntaActiva } = usePreguntas();
  const { registrarRespuesta, respuestas } = useRespuestas(idQuestion);
  const toast = useToast();
  const { user, loading, updating, updateUser } = useUser();
  const [loadingResponse, setLoadingResponse] = useState(false);
  const {
    activeUsers,
    loading: loadingActiveUser,
    isUserActive,
  } = useActiveUsers();

  const time = getTiempoTranscurrido();

  // Función para manejar la selección de respuesta
  const handleAnswerChange = (value) => {
    // Parsear el índice y si es correcta de la respuesta seleccionada
    const [isCorrect, index] = value.split("&").filter(Boolean);

    setSelectedAnswer({
      index: parseInt(index),
      isCorrect: isCorrect === "true",
      respuesta: preguntaActiva?.respuestas[parseInt(index)].respuesta,
    });
  };

  const checkUserAccess = () => {
    if (!user?.id) return false;
    const isActive = isUserActive(user.id);

    // Log para debugging
    console.log("User Access Check:", {
      userId: user.id,
      isActive,
      activeUsersCount: activeUsers.length,
    });

    return isActive;
  };

  if (loading || loadingActiveUser) {
    return <Spinner />;
  }

  // Función para manejar el envío de la respuesta
  const handleSubmit = async () => {
    if (!selectedAnswer) {
      toast({
        title: "Selecciona una respuesta",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setLoadingResponse(true);
    const respuestaData = {
      idPregunta: preguntaActiva?.id,
      respuestaSeleccionada: selectedAnswer.respuesta,
      tiempoRespuesta: time,
      correcta: selectedAnswer.isCorrect,
      nombreUsuario: user?.nombre,
      idUsuario: user?.id,
    };
    const points = selectedAnswer.isCorrect ? user?.puntos + 1 : user?.puntos;
    await updateUser({ ...user, time: user?.time + time, puntos: points });

    await registrarRespuesta(respuestaData);

    // Mostrar feedback al usuario
    toast({
      title: selectedAnswer.isCorrect ? "¡Correcto!" : "Incorrecto",
      description: selectedAnswer.isCorrect
        ? `¡Has acertado en ${time} segundos!`
        : "La respuesta no es correcta",
      status: selectedAnswer.isCorrect ? "success" : "error",
      duration: 3000,
      isClosable: true,
    });
    setLoadingResponse(false);

    // Aquí puedes agregar la lógica para guardar la respuesta en tu backend

    // Resetear la selección
    setSelectedAnswer(null);
  };

  if (loading || loadingActiveUser) return <Spinner />;

  const filterResponses = respuestas.filter(
    (respuesta) => respuesta.idUsuario === user?.id
  );

  if (!checkUserAccess()) {
    return (
      <Box textAlign="center" p={4}>
        <Text fontSize="lg" fontWeight="medium">
          No estás participando en esta pregunta
        </Text>
        <Text fontSize="sm" color="gray.500" mt={2}>
          Debes ser seleccionado para participar
        </Text>
      </Box>
    );
  }

  return (
    <Box padding={5}>
      <Text color={textColor} fontSize="xl" fontWeight="600" mb={5}>
        {preguntaActiva?.pregunta}
      </Text>
      <RadioGroup
        value={
          selectedAnswer
            ? `${selectedAnswer.isCorrect}&${selectedAnswer.index}`
            : ""
        }
        onChange={handleAnswerChange}
      >
        <Stack gap="6">
          {preguntaActiva?.respuestas.map(({ correcta, respuesta }, index) => (
            <Radio value={`${correcta}&${index}`} key={index}>
              {respuesta}
            </Radio>
          ))}
        </Stack>
      </RadioGroup>
      {/* {isRunning && ( */}
      {filterResponses.length === 0 && (
        <Button
          bg="blackAlpha.100"
          color="black"
          _hover={{ bg: "blackAlpha.300" }}
          _active={{ bg: "blackAlpha.100" }}
          _focus={{ bg: "blackAlpha.100" }}
          fontWeight="500"
          fontSize="14px"
          py="20px"
          px="27"
          me="38px"
          marginTop={5}
          onClick={handleSubmit}
          isDisabled={
            !selectedAnswer || time <= 0 || filterResponses.length > 0
          }
          isLoading={loadingResponse}
        >
          Responder
        </Button>
      )}
      {/* )} */}
    </Box>
  );
};

export default FormQuestions;
