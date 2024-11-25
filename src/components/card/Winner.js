// Chakra imports
import {
  AvatarGroup,
  Avatar,
  Box,
  Flex,
  Text,
  useColorModeValue,
  Image,
} from "@chakra-ui/react";
// Custom components
import Card from "components/card/Card.js";
// Assets
import React, { useState } from "react";
import useRespuestas from "firebase-local/hooks/useResponses";

import gifIncorrect from "assets/img/gifs/incorrect.png";
import gifCorrect from "assets/img/gifs/accept.png";
import useUtilidades from "firebase-local/hooks/useUtilidades";

export default function Winner(props) {
  const { bidders, idQuestion } = props;
  const { utilidades } = useUtilidades();

  const { respuestas } = useRespuestas(idQuestion);

  const filterResponseCorrect = respuestas.filter(
    (respuesta) => respuesta.correcta
  );

  const textColor = useColorModeValue("navy.700", "white");
  const textColorBid = useColorModeValue("brand.500", "white");

  if (respuestas.length < 2) return <></>;

  if (!utilidades?.comenzarJuego) return <></>;

  console.log("respuestas", respuestas);

  return (
    <Card p="20px" mb="20px" maxWidth={{ xl: "50%", sm: "100%" }}>
      <Flex direction={{ base: "column" }} justify="center">
        <Box mb={{ base: "20px", "2xl": "20px" }} position="relative">
          <Box flex={1} align="center" justify="center">
            <Image
              src={filterResponseCorrect.length > 0 ? gifCorrect : gifIncorrect}
              alt="gifIncorrect"
              width={"70%"}
              maxWidth={{ xl: "170px", sm: "100px" }}
            />
          </Box>
        </Box>
        <Flex flexDirection="column" justify="space-between" h="100%">
          <Flex
            justify="space-between"
            direction={{
              base: "row",
              md: "column",
              lg: "row",
              xl: "column",
              "2xl": "row",
            }}
            mb="auto"
          >
            <Flex direction="column">
              <Text
                color={textColor}
                fontSize={{
                  base: "xl",
                  md: "lg",
                  lg: "lg",
                  xl: "lg",
                  "2xl": "md",
                  "3xl": "lg",
                }}
                mb="5px"
                fontWeight="bold"
                me="14px"
              >
                {filterResponseCorrect.length > 0
                  ? filterResponseCorrect[0].nombreUsuario
                  : "Ambos perdieron"}
              </Text>
              <Text
                color={textColorBid}
                fontSize={{
                  base: "sm",
                }}
                fontWeight="400 "
                me="14px"
              >
                {filterResponseCorrect.length > 0 ? "Ganador" : ""}
              </Text>
            </Flex>
            <AvatarGroup
              max={3}
              color={textColorBid}
              size="sm"
              mt={{
                base: "0px",
                md: "10px",
                lg: "0px",
                xl: "10px",
                "2xl": "0px",
              }}
              fontSize="12px"
            >
              {bidders.map((avt, key) => (
                <Avatar key={key} src={avt} />
              ))}
            </AvatarGroup>
          </Flex>
        </Flex>
      </Flex>
    </Card>
  );
}
