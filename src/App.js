import { useEffect, useRef, useState } from 'react';
import './App.css';
import Web3Modal from 'web3modal'
import { BigNumber, providers, utils } from 'ethers'
import { getCDTokenBalance, getEtherBalance, getLPTokenBalance, getReserves } from './utills/getAmount';
import { calculateCD } from './utills/addLiquidity'

function App() {
  const [walletConnected, setWalletConnected] = useState(false)
  const web3ModalRef = useRef()
  const zero = BigNumber.from(0)

  const [ethBalance, setEthBalance] = useState(zero)
  const [CDBalance, setCDBalance] = useState(zero)
  const [LPBalance, setLPBalance] = useState(zero)
  const [CDReserves, setCDReserves] = useState(zero)
  const [ethContractBalance, setEthContractBalance] = useState(zero)

  const [liquidityTab, setLiquidityTab] = useState(false)

  const [loading, setLoading] = useState(false)


  const [addEther, setAddEther] = useState(zero)
  const [addCDToken, setAddCDTOken] = useState(zero)

  const [removeLPTOkens, setRemoveLPTOkens] = useState(0)

  const getAmounts = async()=>{
    try {
      const provider = await getProviderOrsinger()
      const signer = await getProviderOrsinger(true)
      const address = await signer.getAddress()

      const _ethBalance = await getEtherBalance(provider, address)
      const _CDBalance = await getCDTokenBalance(provider, address)
      const _LPBalance = await getLPTokenBalance(provider, address)
      const _CDReserves = await getReserves(provider)
      const _ethContractBalance = await getEtherBalance(provider, null, true)

      setEthBalance(_ethBalance)
      setCDBalance(_CDBalance)
      setLPBalance(_LPBalance)
      setCDReserves(_CDReserves)
      setEthContractBalance(_ethContractBalance)

    } catch (error) {
      console.error(error);
    }
  }

  const getProviderOrsinger = async(needSigner) => {
    const provider = await web3ModalRef.current.connect();

      const web3provider = new providers.Web3Provider(provider);

      const { chainId } = await web3provider.getNetwork()
      if(chainId !== 5){
        window.alert("Change Network to goerli")
        throw new Error("Change Network to goerli")
      }

      if(needSigner){
        const signer = await web3provider.getSigner()
        return signer
      }
      return web3provider;
  }

  const connectWallet = async() => {
    try {
      await getProviderOrsinger()
      setWalletConnected(true)
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(()=>{
    if(!walletConnected){
      web3ModalRef.current = new Web3Modal({
        network: 'goerli',
        providerOptions: {},
        disableInjectedProvider: false
      })
      connectWallet()
      getAmounts()
    }
  }, [walletConnected])

  const renderButton = () => {
    if(!walletConnected)
      return <button className='button' onClick={connectWallet}>Connect Wallet</button>
    if(loading)
      return <button className='button'>Loading ...</button>
    if(liquidityTab){
      return <>
        <div className='description'>
              You have
              <br />
              {utils.formatEther(CDBalance)} Crypto Dev Tokens
              <br />
              {utils.formatEther(ethBalance)} Ether
              <br />
              {utils.formatEther(LPBalance)} LP Tokens
        </div>
        <div>
          {utils.parseEther(CDReserves.toString()).eq(zero) ? 
          <div>
              <input type="number" placeholder='Amount of Ether' className='input' onChange={(e)=>setAddEther(e.target.value || "0")}/>
              <input type="number" placeholder='Amount of Crypto Dev Token' className='input' onChange={(e)=>setAddCDTOken(BigNumber.from(utils.parseEther(e.target.value || "0")))}/>
              <button className='button1'>Add Liquidity</button>
          </div> 
          : 
          <div>
            <input type="number" placeholder='Amount of Ether' className='input' onChange={async(e)=>{
              const _addCDToken = await calculateCD(e.target.value || "0", ethContractBalance, CDReserves)
              setAddCDTOken(_addCDToken)
            }}/>
            <button className='button1'>Add Liquidity</button>
            <div className='inputDiv'>{`You will need ${addCDToken} CD Tokens`}</div>
          </div>}
        </div>
        <div>
          <input type="number" placeholder='Amount of LP TOkens' className='input' onChange={async(e) => {
            setRemoveLPTOkens(e.target.value)
          }}/>
        </div>
      </>
    }
  }

  return (
    <div className='main'>
      <div>
        <h1 className='title'>Welcome to Crypto Dev Exchange</h1>
        <div className="description"> Exchange Ethereum &#60;&#62; Crypto Dev Tokens</div>
        <div>
          <button className='button' onClick={()=>setLiquidityTab(true)}>Liquidity</button>
          <button className='button' onClick={()=>setLiquidityTab(false)}>Swap</button>
        </div>
        {renderButton()}
      </div> 

      <div>

      </div>
    </div>
  );
}

export default App;
