import './App.css'
import {BetaRewardsForm} from "./Components/BetaRewards";
import {ChakraProvider} from '@chakra-ui/react'
import {ApiProvider, BatchSenderProvider, WalletProvider} from "./providers";

function App() {
    return (
        <ChakraProvider>
            <ApiProvider>
                <WalletProvider>
                    <BatchSenderProvider>
                        <BetaRewardsForm/>
                    </BatchSenderProvider>
                </WalletProvider>
            </ApiProvider>
        </ChakraProvider>
    )
}

export default App
