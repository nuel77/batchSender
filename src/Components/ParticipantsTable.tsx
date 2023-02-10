import {IconButton, Spinner, Table, TableContainer, Tbody, Td, Th, Thead, Tr,} from '@chakra-ui/react'
import {Participants} from "../hooks/useBatchTransactions";
import {CheckCircleIcon, CloseIcon, DeleteIcon} from "@chakra-ui/icons";

type ParticipantsTableProps = {
    accounts: Participants[]
    sentBatchIndex: number
    failedBatchIndex: number
    loadingBatchIndex: number
    batchSize: number
    deleteAccount: (a: string) => void
}
export const ParticipantsTable = ({
                                      sentBatchIndex,
                                      failedBatchIndex,
                                      loadingBatchIndex,
                                      accounts,
                                      deleteAccount,
                                      batchSize
                                  }: ParticipantsTableProps) => {
    const getStatus = (idx: number, a: string): any => {
        if (sentBatchIndex >= 0 && Math.floor(idx / batchSize) <= sentBatchIndex) {
            return <CheckCircleIcon/>
        } else if (failedBatchIndex >= 0 && Math.floor(idx / batchSize) <= failedBatchIndex) {
            return <CloseIcon/>
        } else if (loadingBatchIndex >= 0 && Math.floor(idx / batchSize) <= loadingBatchIndex) {
            return <Spinner size='sm'/>
        } else return <IconButton
            onClick={() => deleteAccount(a)}
            aria-label='delete row'
            icon={<DeleteIcon/>}
        />
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
                        {accounts.map((a, idx) => {
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