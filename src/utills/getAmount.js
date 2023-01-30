import { Contract } from "ethers";
import { CRYPTODEV_CONTRACT_ADDRESS, CRYPTODEV_CONTRACT_ABI, DEX_CONTRACT_ADDRESS, DEX_CONTRACT_ABI } from '../constants/index'

export const getBalance = async(provider, address, contract = false) => {
    try {
        if(contract){
            const balance = await provider.getBalance(DEX_CONTRACT_ADDRESS)
            return balance;
        }
        else{
            const balance = await provider.getBalance(address)
            return balance;
        }
        
    } catch (error) {
        console.error(error);
        return 0;
    }
}

export const getCDTokenBalance = async(provider, address) => {
    try {
        const contract = new Contract(
            CRYPTODEV_CONTRACT_ADDRESS,
            CRYPTODEV_CONTRACT_ABI,
            provider
        )
        const balance = await contract.balanceOf(address)
        return balance;
    } catch (error) {
        console.error(error);
        return 0;
    }
}

export const getLPTokenBalance = async(provider, address) => {
    try {
        const contract = new Contract(
            DEX_CONTRACT_ADDRESS,
            DEX_CONTRACT_ABI,
            provider
        )
        const balance = await contract.balanceOf(address)
        return balance;
    } catch (error) {
        console.error(error);
    }
}

export const getReserves = async(provider) => {
    try {
        const contract = new Contract(
            DEX_CONTRACT_ADDRESS,
            DEX_CONTRACT_ABI,
            provider
        )
        const balance = await contract.getReserves()
        return balance;
    } catch (error) {
        console.error(error);
        return 0;
    }
}