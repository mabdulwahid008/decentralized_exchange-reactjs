import { useEffect, useRef, useState } from 'react';
import './App.css';
import Web3Modal from 'web3modal'
import { BigNumber, providers, utils } from 'ethers'
import { getCDTokenBalance, getEtherBalance, getLPTokenBalance, getReserves } from './utills/getAmount';
import { addLiquidity, calculateCD } from './utills/addLiquidity'
import { getTokensAfterRemove, removeLiquidity } from './utills/removeLiquidity';
import { getAmountOfTokensReceivedFromSwap, swapTokens } from './utills/swap';

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
  const [addCDToken, setAddCDToken] = useState(zero)

  const [removeLPTokens, setRemoveLPTOkens] = useState(0)
  const [removeEther, setRemoveEther] = useState(zero)
  const [removeCDTokens, setRemoveCDTokens] = useState(zero)

  const [swapAmount, setSwapAmount] = useState("0")
  const [tokenReceivedAfterSwap, setTokenReceivedAfterSwap] = useState(zero)
  const [ethSelected, setEthSelected] = useState(true)

  const _swapTokens = async() => {
    try {
      const swapAmountWei = utils.parseEther(swapAmount.toString())

      if(!swapAmountWei.eq(zero)){
        const signer = await getProviderOrsinger(true)
        setLoading(true)
        await swapTokens(signer, swapAmountWei, tokenReceivedAfterSwap, ethSelected)
        setLoading(false)
        getAmounts()
        setSwapAmount("")
      }
    } catch (error) {
      console.error(error);
    }
  }

  const _getAmountOfTokenReceivedFromSwap = async(swapAmount) => {
    try {
      const _swapAmountWei = utils.parseEther(swapAmount.toString())
      if(!_swapAmountWei.eq(zero)){
        const provider = await getProviderOrsinger()

        const _ethBalance = await getEtherBalance(provider, null, true)

        const amountOfTokens = await getAmountOfTokensReceivedFromSwap(_swapAmountWei, provider, ethSelected, _ethBalance, CDReserves)

        setTokenReceivedAfterSwap(amountOfTokens)
      }
      else
        setTokenReceivedAfterSwap(zero)
    } catch (error) {
      console.error(error);
    }
  }

  const _addLiquidity = async() => {
  try {
    const addEtherWei = utils.parseEther(addEther.toString())

      if(!addCDToken.eq(zero) && !addEtherWei.eq(zero)){
        const signer = await getProviderOrsinger(true)
        setLoading(true)

        await addLiquidity(signer, addCDToken, addEtherWei) 

        setLoading(false)
        setAddCDToken(zero)

        await getAmounts()
      }
      
    } catch (error) {
      console.error(error);
      setLoading(false);
      setAddCDToken(zero);
    }
  }

  const _getTokensAfterRemove = async(_removeLPTokens) => {
    try {
      const provider = await getProviderOrsinger()
      const removeLPToken = utils.parseEther(_removeLPTokens)

      const _ethBalance = await getEtherBalance(provider, null, true)

      const cryptoDevTokens = await getReserves()

      const { _removeEther, _removeCD } = await getTokensAfterRemove(provider, removeLPToken, _ethBalance, cryptoDevTokens)

      setRemoveEther(_removeEther)
      setRemoveCDTokens(_removeCD)

    } catch (error) {
      console.error(error);
    }
  }

  const _removeLiquidity = async() => {
    try {
      const signer = await getProviderOrsinger(true)

      const removeLPTokensWei = utils.parseEther(removeLPTokens)

      setLoading(true)

      await removeLiquidity(signer, removeLPTokensWei)
      setLoading(false)

      await getAmounts();

      setRemoveCDTokens(zero);
      setRemoveEther(zero);
    } catch (error) {
      console.error(error);
      setLoading(false);
      setRemoveCDTokens(zero);
      setRemoveEther(zero);
    }
  }

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
              <input type="number" placeholder='Amount of Crypto Dev Token' className='input' onChange={(e)=>setAddCDToken(BigNumber.from(utils.parseEther(e.target.value || "0")))}/>
              <button className='button1' onClick={_addLiquidity}>Add Liquidity</button>
          </div> 
          : 
          <div>
            <input type="number" placeholder='Amount of Ether' className='input' onChange={async(e)=>{
              const _addCDToken = await calculateCD(e.target.value || "0", ethContractBalance, CDReserves)
              setAddCDToken(_addCDToken)
            }}/>
            <div className='inputDiv'>{`You will need ${addCDToken} CD Tokens`}</div>
            <button className='button1' onClick={_addLiquidity}>Add Liquidity</button>
          </div>}
        </div>
        <div>
          <input type="number" placeholder='Amount of LP TOkens' className='input' onChange={async(e) => {
            setRemoveLPTOkens(e.target.value || "0")
            await _getTokensAfterRemove(removeLPTokens || "0")
          }}/>
          <div className='inputDiv'>{`You will get ${utils.formatEther(removeCDTokens)} Crypto Dev Tokens and ${utils.formatEther(removeEther)} Eth`}</div>
          <button className='button1' onClick={_removeLiquidity}>Remove Liquidity</button>
        </div>
      </>
    }
    else{
      return <div>
        <input type="amount" placeholder='Amount' className='input' value={swapAmount} onChange={async(e)=>{
          setSwapAmount(e.target.value || "0")
          await _getAmountOfTokenReceivedFromSwap(e.target.value || "0")
        }} />
        <select className='select' name='dropdowm' id="dropdown" onChange={async()=> {
          setEthSelected(!ethSelected)
          await _getAmountOfTokenReceivedFromSwap("0")
          setSwapAmount(0)
        }}>
            <option value="eth">Ethereum</option>
            <option value="cryptoDevToken">Crypto Dev Token</option>
        </select>
        <br/>
        <div className='inputDiv'>
          {ethSelected?
          `You will get ${utils.formatEther(tokenReceivedAfterSwap)} CD Tokens`
          :
          `You will get ${utils.formatEther(tokenReceivedAfterSwap)} Ethers`
          }
        </div>
        <button className='button1' onClick={_swapTokens}>Swap</button>
      </div>
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
