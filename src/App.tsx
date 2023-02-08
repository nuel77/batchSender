import './App.css'
import {BetaRewardsForm} from "./Components/BetaRewards";
import { ChakraProvider } from '@chakra-ui/react'
function App() {
  return (
    <ChakraProvider>
        <BetaRewardsForm/>
    </ChakraProvider>
  )
}

export default App
