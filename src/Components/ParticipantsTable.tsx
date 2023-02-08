import {IconButton, Spinner, Table, TableContainer, Tbody, Td, Th, Thead, Tr,} from '@chakra-ui/react'
import {Participants} from "../hooks/useBatchTransactions";
import {CheckCircleIcon, CloseIcon, DeleteIcon} from "@chakra-ui/icons";

type ParticipantsTableProps = {
    accounts: Participants[]
    sentAccounts: string[]
    failedAccounts: string[]
    loadingAccounts: string[]

    deleteAccount: (a: string) => void
}
export const ParticipantsTable = ({
                                      sentAccounts,
                                      failedAccounts,
                                      loadingAccounts,
                                      accounts,
                                      deleteAccount,
                                  }: ParticipantsTableProps) => {
    const getStatus = (a: string): any => {
        if (sentAccounts.includes(a)) {
            return <CheckCircleIcon/>
        } else if (failedAccounts.includes(a)) {
            return <CloseIcon/>
        } else if (loadingAccounts.includes(a)) {
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
                            <Th>Address</Th>
                            <Th isNumeric>Amount</Th>
                            <Th>Status</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {accounts.map((a) => {
                            return (
                                <Tr key={a.address}>
                                    <Td>{a.address}</Td>
                                    <Td isNumeric>{a.amount}</Td>
                                    <Td>{getStatus(a.address)}</Td>
                                </Tr>
                            )
                        })}
                    </Tbody>
                </Table>
            </TableContainer>
        </>
    )
}