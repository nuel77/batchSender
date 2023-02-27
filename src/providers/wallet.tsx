import React, {useEffect} from "react";
import {cryptoWaitReady} from "@polkadot/util-crypto";
import {web3Accounts, web3Enable, web3EnablePromise, web3FromAddress} from "@polkadot/extension-dapp";

export type Account = {
    address: string
    name: string | undefined
    injector: any
}

export type ContextState = {
    accounts: Account[]
    selectedAccount?: Account
    selectAccount?: (account: Account | undefined) => void
}

export const WalletContext = React.createContext<ContextState>({accounts: []});

export const WalletProvider = ({children}: React.PropsWithChildren<unknown>) => {
    const [accounts, setAccounts] = React.useState<Account[]>([])
    const [selectedAccount, setSelectedAccount] = React.useState<Account>()

    const selectAccount = (account: Account | undefined) => {
        if (!account) {
            alert("Account not found")
            return
        }
        setSelectedAccount(account)
    }

    useEffect(() => {
        const init = async () => {
            await cryptoWaitReady()
            await web3Enable('polkadex-internal');
            await web3EnablePromise
            const allAccounts = await web3Accounts();
            const accountPromises = allAccounts.map(async (account) => {
                const injector = await web3FromAddress(account.address);
                return {
                    address: account.address,
                    name: account.meta.name,
                    injector,
                }
            })
            const accounts = await Promise.all(accountPromises)
            setAccounts(accounts)
        }
        init().then(console.log)
    }, [])
    return (
        <WalletContext.Provider value={{accounts, selectAccount, selectedAccount}}>
            {children}
        </WalletContext.Provider>
    )
}