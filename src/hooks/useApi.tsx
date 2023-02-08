import {ApiPromise, WsProvider} from "@polkadot/api";
import {useEffect, useState} from "react";

let api: ApiPromise
const createApi = async (url: string) => {
    const provider = new WsProvider(url);
    api = new ApiPromise({provider});
}

export const useApi = () => {
    const [isApiConnected, setIsApiConnected] = useState<boolean>(false)
    const [IsApiInitialized, setIsApiInitialized] = useState<boolean>(false)
    let url = "wss://blockchain.polkadex.trade"
    useEffect((): void => {
        createApi(url)
            .then((types): void => {
                api.on('connected', () => setIsApiConnected(true));
                api.on('disconnected', () => setIsApiConnected(false));
                api.on('error', alert);
                api.on('ready', (): void => {
                    setIsApiInitialized(true);
                });
            })
            .catch(alert);
    }, []);
    return {
        isApiConnected,
        IsApiInitialized,
        api
    }
}