import {IconButton, Spinner, Table, TableContainer, Tbody, Td, Th, Thead, Tr,} from '@chakra-ui/react'
import {useBatchSender} from "../hooks";
import {CheckCircleIcon, CloseIcon, DeleteIcon} from "@chakra-ui/icons";
import {Participant} from "../providers";

export const ParticipantsTable = () => {
    const {participants, deleteParticipant} = useBatchSender()
    const getStatus = (address: string, status: Participant["status"]) => {
        if (status === "initialized") {
            return <IconButton
                onClick={() => deleteParticipant?.(address)}
                aria-label='delete row'
                icon={<DeleteIcon/>}
            />
        } else if (status === "sent") {
            return <CheckCircleIcon color='green.500'/>
        } else if (status === "failed") {
            return <CloseIcon color='red.500'/>
        } else if (status === "loading") {
            return <Spinner size='sm' color='green.500'/>
        }
    }
    return (
        <>
            <TableContainer>
                <Table variant='simple'>
                    <Thead>
                        <Tr>
                            <Th>Index</Th>
                            <Th>Address</Th>
                            <Th isNumeric>Amount</Th>
                            <Th>Status</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {participants.map((a, idx) => {
                            return (
                                <Tr key={a.address}>
                                    <Td>{idx}</Td>
                                    <Td>{a.address}</Td>
                                    <Td isNumeric>{a.amount}</Td>
                                    <Td>{getStatus(a.address, a.status)}</Td>
                                </Tr>
                            )
                        })}
                    </Tbody>
                </Table>
            </TableContainer>
        </>
    )
}