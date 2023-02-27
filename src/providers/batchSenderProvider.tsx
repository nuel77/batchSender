import React, {useCallback, useState} from "react";
import {useApi} from "../hooks";
import {Account} from "./wallet";
import Utils from "@polkadex/utils";
import {signAndSubmitPromiseWrapper} from "@polkadex/blockchain-api"
import {SubmittableExtrinsic} from "@polkadot/api/promise/types";

export type Participant = {
    address: string,
    amount: string | number
    status: "loading" | "sent" | "failed" | "initialized"
}


const UNIT = 12;


type ContextState = {
    participants: Participant[]
    batchSendToParticipants?: (sender: Account, batchSize: number) => Promise<void>
    updateParticipants?: (participants: Participant[]) => void
    deleteParticipant?: (address: string) => void
}
export const BatchSenderContext = React.createContext<ContextState>({participants: []})

export const BatchSenderProvider = ({children}: React.PropsWithChildren<unknown>) => {
    const {isApiConnected, api} = useApi()
    const [participants, setParticipants] = useState<Participant[]>([])
    const updateBatchStatus = (batch: Participant[], status: Participant["status"]) => {
        setParticipants((participants) => {
            return participants.map((elem) => {
                if (batch.find((e) => e.address === elem.address)) {
                    return {...elem, status}
                }
                return elem
            })
        })
    }

    const deleteParticipant = (address: string) => {
        setParticipants(participants => participants.filter((elem) => elem.address !== address))
    }
    const updateParticipants = (participants: Participant[]) => {
        setParticipants(participants)
    }

    const batchSendToParticipantPromise = useCallback(async (accs: Participant[], sender: Account) => {
        if (!api) {
            throw new Error("api is not initialized")
        }
        const txs = accs.map((elem => {
            const amount = Utils.parseUnits(parseFloat(elem.amount.toString()).toFixed(3), UNIT)
            return api.tx.balances.transfer(elem.address, amount)
        }))
        const tx:any = api.tx.utility.batchAll(txs)
        // @ts-ignore
        await signAndSubmitPromiseWrapper({
            tx,
            address: sender.address,
            signer: sender.injector.signer,
            criteria: "IS_IN_BLOCK"
        })
    }, [api])

    const batchSendToParticipants = async (account: Account, batchSize: number): Promise<void> => {
        if (!isApiConnected || !api) {
            alert("connection failed")
            return
        }
        if (!account) {
            alert("No Account selected")
            return
        }
        const batches = createBatches(participants, batchSize)
        console.log("batches", batches)
        for (let i = 0; i < batches.length; i += 1) {
            try {
                updateBatchStatus(batches[i], "loading")
                await batchSendToParticipantPromise(batches[i], account);
                updateBatchStatus(batches[i], "sent")
            } catch (e) {
                console.log("error", e)
                updateBatchStatus(batches[i], "failed")
            }
        }
    }
    const value = {
        batchSendToParticipants,
        participants,
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