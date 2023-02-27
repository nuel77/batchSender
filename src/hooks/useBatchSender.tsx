import {useContext} from "react";
import {BatchSenderContext} from "../providers";

export const useBatchSender= () => {
    return useContext(BatchSenderContext)
}