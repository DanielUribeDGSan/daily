import {
  Box,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { useState } from "react";

function AlertDialogJira() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [size, setSize] = useState("md");

  const handleSizeClick = (newSize) => {
    setSize(newSize);
    onOpen();
  };

  const sizes = ["full"];

  return (
    <>
      {sizes.map((size) => (
        <Box
          display={"flex"}
          alignItems={"end"}
          justifyContent={"end"}
          width={"100%"}
        >
          <Button
            onClick={() => handleSizeClick(size)}
            key={size}
            m={4}
            width={"auto"}
          >
            Ver tareas de jira
          </Button>
        </Box>
      ))}

      <Modal onClose={onClose} size={size} isOpen={isOpen}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody>
            <iframe
              src="https://alemana.atlassian.net/jira/software/projects/VDV/boards/12"
              width="100%"
              height="100%"
              className="absolute top-0 left-0 w-full h-full"
              style={{ minHeight: "88vh" }}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

export default AlertDialogJira;
