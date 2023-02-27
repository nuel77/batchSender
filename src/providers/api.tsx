import {ApiPromise, WsProvider} from "@polkadot/api";
import React, {useEffect, useState} from "react";

let api: ApiPromise
const createApi = async (url: string) => {
    const provider = new WsProvider(url);
    api = new ApiPromise({provider});
    return api
}

export type ApiContextType = {
    isApiConnected: boolean
    IsApiInitialized: boolean
    api: ApiPromise | null
}
export const ApiContext = React.createContext<ApiContextType>({
    isApiConnected: false,
    IsApiInitialized: false,
    api: null
})
export const ApiProvider = ({children}: React.PropsWithChildren<unknown>) => {
    const [isApiConnected, setIsApiConnected] = useState<boolean>(false)
    const [IsApiInitialized, setIsApiInitialized] = useState<boolean>(false)
    const [api, setApi] = useState<ApiPromise | null>(null)
    let url = "wss://blockchain.polkadex.trade"
    useEffect((): void => {
        createApi(url)
            .then((api): void => {
                setApi(api)
                api.on('connected', () => setIsApiConnected(true));
                api.on('disconnected', () => setIsApiConnected(false));
                api.on('error', alert);
                api.on('ready', (): void => {
                    setIsApiInitialized(true);
                });
            })
            .catch(alert);
    }, []);
    return <ApiContext.Provider value={{isApiConnected, IsApiInitialized, api}}>{children}</ApiContext.Provider>
}