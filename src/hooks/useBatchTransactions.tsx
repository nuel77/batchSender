import {useState} from "react";
import {useApi} from "./useApi";
import {Account} from "../Components/BetaRewards";

export type Participants = {
    address: string,
    amount: string | number
}
const UNIT = 10 ** 12;

export const useBatchTransactions = () => {
    const {isApiConnected, api} = useApi()
    const batchSendToParticipantPromise = (accs: Participants[], sender: Account) => {
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
    }
    type batchSendConfig = {
        accounts: Participants[]
        pushToLoadingAccounts: (a: number) => void
        pushToSentAccounts: (a: number) => void
        pushToFailedAccounts: (a: number) => void
        seedPhrase?: string
        sender?: Account
        batchSize: number
    }
    const batchSendToParticipants = async (params: batchSendConfig): Promise<void> => {
        if (!isApiConnected) {
            alert("connection failed")
            return
        }
        if (!params.sender) {
            alert("account has no access")
            return
        }
        const {accounts} = params
        const batches = createBatches(accounts, params.batchSize)
        console.log("batches", batches)
        for (let i = 0; i < batches.length; i += 1) {
            try {
                params.pushToLoadingAccounts(i)
                await batchSendToParticipantPromise(batches[i], params.sender);
                params.pushToSentAccounts(i)
            } catch (e) {
                params.pushToFailedAccounts(i)
            }
        }
    }

    return {
        batchSendToParticipants,
    }
}

const createBatches = (accounts: Participants[], batchSize: number): Participants[][] => {
    let batches: Participants[][] = []
    let tmp: Participants[] = []
    for (let i = 0; i < accounts.length; i++) {
        tmp.push(accounts[i]);
        if (i > 0 && (i-1) % batchSize === 0 ) {
            batches.push(tmp)
            tmp = []
        }
    }
    return batches
}