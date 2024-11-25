import {
  Avatar,
  Box,
  Checkbox,
  Flex,
  Progress,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import useActiveUsers from "firebase-local/hooks/useActiveUser";
import useUser from "firebase-local/hooks/useUser";

import * as React from "react";
import AlertDialogJira from "./DialogJira";

const columnHelper = createColumnHelper();

const getInitials = (name) => {
  if (!name) return "U";
  const nameParts = name.trim().split(" ");
  if (nameParts.length > 1) {
    return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
  } else {
    const singleName = nameParts[0];
    return (singleName[0] + singleName[singleName.length - 1]).toUpperCase();
  }
};

export default function TopCreatorTable() {
  const [sorting, setSorting] = React.useState([]);
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const textColorSecondary = useColorModeValue("secondaryGray.600", "white");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  const { allUsers, loadingUsers } = useUser();
  const {
    activeUsers,
    registerActiveUser,
    removeActiveUser,
    loading: loadingActiveUsers,
  } = useActiveUsers();
  const toast = useToast();

  // Estado para manejar las selecciones
  const [selectedUsers, setSelectedUsers] = React.useState({});

  // Efecto para sincronizar el estado de selección con los usuarios activos
  React.useEffect(() => {
    if (activeUsers) {
      const activeUsersMap = activeUsers.reduce((acc, user) => {
        acc[user.userId] = true;
        return acc;
      }, {});
      setSelectedUsers(activeUsersMap);
    }
  }, [activeUsers]);

  // Manejador para el cambio de checkbox
  const handleCheckboxChange = async (userId, userData) => {
    try {
      if (selectedUsers[userId]) {
        // Si está seleccionado, lo removemos
        await removeActiveUser(userId);
        setSelectedUsers((prev) => ({ ...prev, [userId]: false }));
        toast({
          title: "Usuario removido",
          description: "El usuario ya no está activo para jugar",
          status: "info",
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Si no está seleccionado, lo agregamos
        await registerActiveUser(userId, {
          nombre: userData.nombre,
          puntos: userData.puntos,
          time: userData.time,
        });
        setSelectedUsers((prev) => ({ ...prev, [userId]: true }));
        toast({
          title: "Usuario activado",
          description: "El usuario está listo para jugar",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del usuario",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const columns = [
    // Nueva columna para el checkbox
    columnHelper.accessor("id", {
      id: "selection",
      header: () => (
        <Text fontSize={{ sm: "10px", lg: "12px" }} color="gray.400">
          Activar
        </Text>
      ),
      cell: (info) => {
        const userId = info.getValue();
        return (
          <Checkbox
            isChecked={selectedUsers[userId] || false}
            onChange={() => handleCheckboxChange(userId, info.row.original)}
            colorScheme="green"
            isDisabled={loadingActiveUsers}
          />
        );
      },
    }),
    // Resto de las columnas...
    columnHelper.accessor("nombre", {
      id: "nombre",
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: "10px", lg: "12px" }}
          color="gray.400"
        >
          Nombre
        </Text>
      ),
      cell: (info) => {
        const nombre = info.getValue();
        const initials = getInitials(nombre);
        return (
          <Flex align="center">
            <Avatar
              name={nombre}
              src={""}
              w="30px"
              h="30px"
              me="8px"
              bg="navy.700"
              color="white"
              fontWeight="600"
              fontSize={"10px"}
              sx={{
                "& .chakra-avatar__initials": {
                  fontSize: "13px",
                },
              }}
            />
            <Text color={textColor} fontSize="sm" fontWeight="600">
              {nombre}
            </Text>
          </Flex>
        );
      },
    }),
    columnHelper.accessor("puntos", {
      id: "puntos",
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: "10px", lg: "12px" }}
          color="gray.400"
        >
          Puntos
        </Text>
      ),
      cell: (info) => (
        <Text color={textColorSecondary} fontSize="sm" fontWeight="500">
          {info.getValue() || 0}
        </Text>
      ),
    }),
    columnHelper.accessor("time", {
      id: "time",
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: "10px", lg: "12px" }}
          color="gray.400"
        >
          Tiempo
        </Text>
      ),
      cell: (info) => (
        <Text color={textColorSecondary} fontSize="sm" fontWeight="500">
          {info.getValue() || 0} seg
        </Text>
      ),
    }),
    columnHelper.accessor("activo", {
      id: "activo",
      header: () => (
        <Text
          justifyContent="space-between"
          align="center"
          fontSize={{ sm: "10px", lg: "12px" }}
          color="gray.400"
        >
          Estado
        </Text>
      ),
      cell: (info) => {
        const userId = info.row.original.id;
        const isActive = selectedUsers[userId];
        return (
          <Flex align="center">
            <Progress
              variant="table"
              colorScheme={isActive ? "green" : "gray"}
              h="8px"
              w="108px"
              value={isActive ? 100 : 0}
            />
            <Text ml="2" color={textColorSecondary} fontSize="sm">
              {isActive ? "Activo" : "Inactivo"}
            </Text>
          </Flex>
        );
      },
    }),
  ];

  const tableData = React.useMemo(() => {
    return allUsers
      .filter((user) => user.type === "jugador")
      .sort((a, b) => b.puntos - a.puntos)
      .map((user) => ({
        id: user.id, // Asegúrate de incluir el ID
        nombre: user.nombre,
        puntos: user.puntos,
        time: user.time,
        activo: user.activo,
        photoURL: user.photoURL,
        fechaCreacion: user.fechaCreacion,
      }));
  }, [allUsers]);

  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: true,
  });

  if (loadingUsers || loadingActiveUsers) {
    return (
      <Flex justify="center" align="center" h="200px">
        <Text>Cargando jugadores...</Text>
      </Flex>
    );
  }

  return (
    <Flex
      direction="column"
      w="100%"
      overflowX={{ sm: "scroll", lg: "hidden" }}
      minW={{ sm: "100%", md: "100%", xl: "650px" }}
    >
      <AlertDialogJira />
      <Flex
        align={{ sm: "flex-start", lg: "center" }}
        justify="space-between"
        w="100%"
        px="22px"
        pb="20px"
        mb="10px"
        boxShadow="0px 40px 58px -20px rgba(112, 144, 176, 0.26)"
      >
        <Text color={textColor} fontSize="xl" fontWeight="600">
          Jugadores ({tableData.length})
        </Text>
      </Flex>
      <Box>
        <Table variant="simple" color="gray.500" mt="12px">
          <Thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <Tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <Th
                      key={header.id}
                      colSpan={header.colSpan}
                      pe="10px"
                      borderColor={borderColor}
                      cursor="pointer"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <Flex
                        justifyContent="space-between"
                        align="center"
                        fontSize={{ sm: "10px", lg: "12px" }}
                        color="gray.400"
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: "↑",
                          desc: "↓",
                        }[header.column.getIsSorted()] ?? null}
                      </Flex>
                    </Th>
                  );
                })}
              </Tr>
            ))}
          </Thead>
          <Tbody>
            {table.getRowModel().rows.map((row) => {
              return (
                <Tr key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <Td
                        key={cell.id}
                        fontSize={{ sm: "14px" }}
                        minW={{ sm: "150px", md: "200px", lg: "auto" }}
                        borderColor="transparent"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </Td>
                    );
                  })}
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Box>
    </Flex>
  );
}
