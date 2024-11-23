/*!
  _   _  ___  ____  ___ ________  _   _   _   _ ___   
 | | | |/ _ \|  _ \|_ _|__  / _ \| \ | | | | | |_ _| 
 | |_| | | | | |_) || |  / / | | |  \| | | | | || | 
 |  _  | |_| |  _ < | | / /| |_| | |\  | | |_| || |
 |_| |_|\___/|_| \_\___/____\___/|_| \_|  \___/|___|
                                                                                                                                                                                                                                                                                                                                       
=========================================================
* Horizon UI - v1.1.0
=========================================================

* Product Page: https://www.horizon-ui.com/
* Copyright 2023 Horizon UI (https://www.horizon-ui.com/)

* Designed and Coded by Simmmple

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/

import React from "react";
import { useTimer } from "react-timer-hook";

// Chakra imports
import { Box, Flex, Grid, SimpleGrid, Spinner } from "@chakra-ui/react";

// Custom components
import TableTopCreators from "views/admin/marketplace/components/TableTopCreators";
import Winner from "components/card/Winner";
import Card from "components/card/Card.js";

// Assets
import Nft1 from "assets/img/nfts/Nft1.png";
import tableDataTopCreators from "views/admin/marketplace/variables/tableDataTopCreators.json";
import { tableColumnsTopCreators } from "views/admin/marketplace/variables/tableColumnsTopCreators";

import Avatar1 from "assets/img/avatars/avatar1.png";
import Avatar2 from "assets/img/avatars/avatar2.png";
import FormQuestions from "./components/FormQuestions";
import AlertDialogExample from "./components/DialogRegister";
import useUser from "firebase-local/hooks/useUser";

import Timer from "./components/Timer";
import usePreguntas from "firebase-local/hooks/useQuestions";

export default function Questions() {
  // Chakra Color Mode
  const { loading } = useUser();
  const { preguntaActiva } = usePreguntas();

  if (loading) {
    return (
      <Box flex={1} align="center" justify="center">
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="blue.500"
          size="xl"
        />
      </Box>
    );
  }

  return (
    <Box pt={{ base: "90px", md: "80px", xl: "80px" }}>
      <AlertDialogExample />

      {/* Main Fields */}
      <Grid
        mb="20px"
        gridTemplateColumns={{ xl: "repeat(3, 1fr)", "2xl": "1fr 0.46fr" }}
        gap={{ base: "20px", xl: "20px" }}
        display={{ base: "block", xl: "grid" }}
      >
        <Flex
          flexDirection="column"
          gridArea={{ xl: "1 / 1 / 2 / 3", "2xl": "1 / 1 / 2 / 2" }}
        >
          <Grid
            templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
            gap="20px"
            mb="20px"
          >
            <Card
              px="0px"
              mb="20px"
              maxWidth={{ xl: "100%", sm: "100%" }}
              flex={1}
            >
              {preguntaActiva && (
                <FormQuestions idQuestion={preguntaActiva.id} />
              )}
            </Card>
            {preguntaActiva && <Timer idQuestion={preguntaActiva.id} />}

            <SimpleGrid columns={{ base: 1, md: 1 }} gap="20px">
              {preguntaActiva && (
                <Winner
                  name="Daniel Uribe"
                  author="Ganador"
                  bidders={[Avatar1, Avatar2]}
                  image={Nft1}
                  currentbid="0.91 ETH"
                  download="#"
                  idQuestion={preguntaActiva.id}
                />
              )}
            </SimpleGrid>
          </Grid>
        </Flex>

        <Flex
          flexDirection="column"
          gridArea={{ xl: "1 / 3 / 2 / 4", "2xl": "1 / 2 / 2 / 3" }}
        >
          <Card px="0px" mb="20px">
            <TableTopCreators
              tableData={tableDataTopCreators}
              columnsData={tableColumnsTopCreators}
            />
          </Card>
        </Flex>
      </Grid>
      {/* Delete Product */}
    </Box>
  );
}
