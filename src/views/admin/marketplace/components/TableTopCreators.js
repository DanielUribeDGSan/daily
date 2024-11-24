/* eslint-disable */
import {
  Avatar,
  Box,
  Button,
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
} from "@chakra-ui/react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import useUser from "firebase-local/hooks/useUser";
import * as React from "react";

const columnHelper = createColumnHelper();

// Función para obtener las iniciales según las reglas especificadas
const getInitials = (name) => {
  if (!name) return "U";

  const nameParts = name.trim().split(" ");

  if (nameParts.length > 1) {
    // Si hay nombre y apellido, tomar la primera letra de cada uno
    return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
  } else {
    // Si solo hay un nombre, tomar la primera y última letra
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

  const columns = [
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
        const activo = info.getValue();
        return (
          <Flex align="center">
            <Progress
              variant="table"
              colorScheme={activo ? "green" : "gray"}
              h="8px"
              w="108px"
              value={activo ? 100 : 0}
            />
            <Text ml="2" color={textColorSecondary} fontSize="sm">
              {activo ? "Activo" : "Inactivo"}
            </Text>
          </Flex>
        );
      },
    }),
  ];

  // Filtrar usuarios que son de tipo "jugador"
  const tableData = React.useMemo(() => {
    return allUsers
      .filter((user) => user.type === "jugador")
      .sort((a, b) => b.puntos - a.puntos)
      .map((user) => ({
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

  if (loadingUsers) {
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
    >
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
