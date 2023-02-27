import {IconButton, Spinner, Table, TableContainer, Tbody, Td, Th, Thead, Tr,} from '@chakra-ui/react'
import {useBatchSender} from "../hooks";
import {CheckCircleIcon, CloseIcon, DeleteIcon} from "@chakra-ui/icons";

export const ParticipantsTable = () => {
    const {participants, deleteParticipant} = useBatchSender()
    const getStatus = (idx: number, address: string) => {
        const account = participants.find(a => a.address === address)
        if (account) {
            if (account.status === "initialized") {
                return <Spinner size='sm' color='green.500'/>
            } else if (account.status === "sent") {
                return <CheckCircleIcon color='green.500'/>
            } else if (account.status === "failed") {
                return <CloseIcon color='red.500'/>
            } else return <IconButton
                onClick={() => deleteParticipant?.(address)}
                aria-label='delete row'
                icon={<DeleteIcon/>}
            />
        }
        return <></>
    }
    return (
        <>
            <TableContainer>
                <Table variant='simple'>
                    <Thead>
                        <Tr>
                            <Th>Batch Id</Th>
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
                                    <Td>{getStatus(idx, a.address)}</Td>
                                </Tr>
                            )
                        })}
                    </Tbody>
                </Table>
            </TableContainer>
        </>
    )
}