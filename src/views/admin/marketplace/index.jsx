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

// Chakra imports
import { Box, Flex, Grid, SimpleGrid } from "@chakra-ui/react";

// Custom components
import Banner from "views/admin/marketplace/components/Banner";
import TableTopCreators from "views/admin/marketplace/components/TableTopCreators";
import Card from "components/card/Card.js";
import Winner from "components/card/Winner";

// Assets
import Nft1 from "assets/img/nfts/Nft1.png";

import Avatar1 from "assets/img/avatars/avatar1.png";
import Avatar2 from "assets/img/avatars/avatar2.png";

import tableDataTopCreators from "views/admin/marketplace/variables/tableDataTopCreators.json";
import { tableColumnsTopCreators } from "views/admin/marketplace/variables/tableColumnsTopCreators";
import useUtilidades from "firebase-local/hooks/useUtilidades";
import Timer from "../questions/components/Timer";
import usePreguntas from "firebase-local/hooks/useQuestions";

export default function Marketplace() {
  const { utilidades } = useUtilidades();
  const { preguntaActiva } = usePreguntas();

  // Chakra Color Mode

  return (
    <Box pt={{ base: "90px", md: "80px", xl: "80px" }} flex={1}>
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
            <Banner />
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
