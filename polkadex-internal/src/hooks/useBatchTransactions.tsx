import {Keyring} from "@polkadot/api";
import {useState} from "react";
import {useApi} from "./useApi";

export type Participants = {
    address: string,
    amount: string | number
}
const UNIT = 10 ** 12;
const PHRASE = 'entire material egg meadow latin bargain dutch coral blood melt acoustic thought';

export const useBatchTransactions = () => {
    const {isApiConnected, api} = useApi()
    const [state, setState] = useState("hello")
    const keyring = new Keyring({type: 'sr25519'});
    const pair = keyring.addFromUri(PHRASE);
    const batchSendToParticipantPromise = (acc: Participants) => {
        const tx = api.tx.balances.transfer(acc.address, Number(acc.amount) * UNIT);
        return new Promise((resolve, reject) => {
            tx.signAndSend(pair, (result) => {
                console.log(`Current status is ${result.status}`);
                if (result.status.isInBlock || result.status.isFinalized) {
                    resolve(acc.address)
                } else if (result.isError) {
                    reject(acc.address)
                }
            })
        })
    }
    type batchSendConfig = {
        accounts: Participants[]
        pushToLoadingAccounts: (a: string) => void
        pushToSentAccounts: (a: string) => void
        pushToFailedAccounts: (a: string) => void
    }
    const batchSendToParticipants = async (params: batchSendConfig): Promise<void> => {
        if (isApiConnected) {
            const {accounts} = params
            for (let i = 0; i < accounts.length; i += 1) {
                try {
                    setState("noi")
                    params.pushToLoadingAccounts(accounts[i].address)
                    await batchSendToParticipantPromise(accounts[i]);
                    params.pushToSentAccounts(accounts[i].address)
                } catch (e) {
                    params.pushToFailedAccounts(accounts[i].address)
                }
            }
            console.log(state)
        } else {
            alert("connection failed")
        }
    }

    return {
        batchSendToParticipants,
    }
}
