import React, {useCallback, useState} from "react";
import {useApi, useWallet} from "../hooks";
import {Account} from "./wallet";

export type Participant = {
    address: string,
    amount: string | number
    status: "loading" | "sent" | "failed" | "initialized"
}



const UNIT = 10 ** 12;


type ContextState = {
    batchSize: number
    participants: Participant[]
    batchSendToParticipants?: () => Promise<void>
    updateBatchSize?: (size: number) => void
    updateParticipants?: (participants: Participant[]) => void
    deleteParticipant?: (address: string) => void
}
export const BatchSenderContext = React.createContext<ContextState>({batchSize: -1, participants: []})

export const BatchSenderProvider = ({children}: React.PropsWithChildren<unknown>) => {
    const {isApiConnected, api} = useApi()
    const [batchSize, setBatchSize] = useState<number>(-1)
    const [participants, setParticipants] = useState<Participant[]>([])
    const {selectedAccount} = useWallet()
    const updateBatchStatus = (batch: Participant[], status:Participant["status"]) => {
        const newParticipants = participants.map((elem) => {
            if (batch.find((e) => e.address === elem.address)) {
                return {...elem, status}
            }
            return elem
        })
        setParticipants(newParticipants)
    }

    const updateBatchSize = (size: number) => {
        setBatchSize(size)
    }
    const deleteParticipant = (address: string) => {
        const newParticipants = participants.filter((elem) => elem.address !== address)
        setParticipants(newParticipants)
    }
    const updateParticipants = (participants: Participant[]) => {
        setParticipants(participants)
    }

    const batchSendToParticipantPromise = useCallback((accs: Participant[], sender: Account) => {
        if (!api) {
            throw new Error("api is not initialized")
        }
        const txs = accs.map((elem => api.tx.balances.transfer(elem.address, Number(elem.amount) * UNIT)))
        const tx = api.tx.utility.batch(txs)
        return new Promise((resolve, reject) => {
            tx.signAndSend(sender.address, {signer: sender.injector.signer}, (result) => {
                console.log(`Current status is ${result.status}`);
                if (result.status.isInBlock || result.status.isFinalized) {
                    resolve("")
                } else if (result.isError) {
                    reject()
                }
            })
        })
    }, [api])

    const batchSendToParticipants = async (): Promise<void> => {
        if (!isApiConnected || !api) {
            alert("connection failed")
            return
        }
        if (!selectedAccount) {
            alert("account has no access")
            return
        }
        const batches = createBatches(participants, batchSize)
        console.log("batches", batches)
        for (let i = 0; i < batches.length; i += 1) {
            try {
                updateBatchStatus(batches[i], "loading")
                await batchSendToParticipantPromise(batches[i - 1], selectedAccount);
                updateBatchStatus(batches[i], "sent")
            } catch (e) {
                console.log("error", e)
                updateBatchStatus(batches[i], "failed")
            }
        }
    }
    const value = {
        batchSendToParticipants,
        batchSize,
        participants,
        updateBatchSize,
        updateParticipants,
        deleteParticipant
    }
    return <BatchSenderContext.Provider value={value}>{children}</BatchSenderContext.Provider>
}

const createBatches = (accounts: Participant[], batchSize: number): Participant[][] => {
    const batches: Participant[][] = []
    let batch: Participant[] = []
    for (let i = 0; i < accounts.length; i += 1) {
        batch.push(accounts[i])
        if (batch.length === batchSize) {
            batches.push(batch)
            batch = []
        }
    }
    if (batch.length > 0) {
        batches.push(batch)
    }
    return batches
}