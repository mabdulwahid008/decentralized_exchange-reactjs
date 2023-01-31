import { Contract } from 'ethers'
import { CRYPTODEV_CONTRACT_ADDRESS, CRYPTODEV_CONTRACT_ABI, DEX_CONTRACT_ADDRESS, DEX_CONTRACT_ABI } from '../constants/index'

export const getAmountOfTokensReceivedFromSwap = async(_swapAmountWei, provider, ethSelected, ethBalance, reservedCD) => {
    try {
        const contract = new Contract(
            DEX_CONTRACT_ADDRESS,
            DEX_CONTRACT_ABI,
            provider
        )

        let amountOfTokens;

        if(ethSelected){
            amountOfTokens = await contract.getAmountOfTokens(_swapAmountWei, ethBalance, reservedCD)
        }
        else{
            amountOfTokens = await contract.getAmountOfTokens(_swapAmountWei, reservedCD, ethBalance)
        }
        return amountOfTokens;
    } catch (error) {
        console.error(error);
    }
}

export const swapTokens = async(signer, swapAmountWei, tokensToBeRecievedAfterSwap, ethSelected) => {
    try {
        const exchangeContract = new Contract(
            DEX_CONTRACT_ADDRESS,
            DEX_CONTRACT_ABI,
            signer
        )

        const tokenContract = new Contract(
            CRYPTODEV_CONTRACT_ADDRESS,
            CRYPTODEV_CONTRACT_ABI,
            signer
        )

        let tx;

        if(ethSelected){
            tx = await exchangeContract.ethToCryptoDevToken(tokensToBeRecievedAfterSwap, {value : swapAmountWei})
        }
        else{
            tx = await tokenContract.approve(DEX_CONTRACT_ADDRESS, swapAmountWei.toString())
        }

        await tx.wait();

        tx = await exchangeContract.cryptoDevTokenToEth(swapAmountWei, tokensToBeRecievedAfterSwap)

        await tx.wait()
    } catch (error) {
        console.error(error);
    }
}