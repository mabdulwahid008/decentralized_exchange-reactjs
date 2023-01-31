import { useEffect, useRef, useState } from 'react';
import './App.css';
import Web3Modal from 'web3modal'

function App() {
  const [walletConnected, setWalletConnected] = useState(false)
  const web3ModalRef = useRef()

  useEffect(()=>{
    if(!walletConnected){
      web3ModalRef.current = new web3Modal({
        network: 'goerli',
        providerOptions: {},
        disableInjectedProvider: false
      })
    }
  }, [walletConnected])

  return (
    <div className='main'>
      <div>
        <h1 className='title'>Welcome to Crypto Dev Exchange</h1>
        <div className="description"> Exchange Ethereum &#60;&#62; Crypto Dev Tokens</div>
      </div> 
      <div>

      </div>
    </div>
  );
}

export default App;
