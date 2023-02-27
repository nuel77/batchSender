import {useContext} from "react";
import {WalletContext} from "../providers";

export const useWallet = () => {
    const state = useContext(WalletContext);
    return {...state};
}