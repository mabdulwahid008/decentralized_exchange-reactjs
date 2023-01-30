import { Contract } from "ethers";
import { DEX_CONTRACT_ABI, DEX_CONTRACT_ADDRESS } from "../constants";

export const removeLiquidity = async(signer, removeLPTokensWei) => {
    try {
        const contract = new Contract(
            DEX_CONTRACT_ADDRESS,
            DEX_CONTRACT_ABI,
            signer
        )
        const tx = await contract.removeLiquidity(removeLPTokensWei)
        await tx.wait();
    } catch (error) {
        console.error(error);
    }
}

const getTokensAfterRemove = async(provider, removeLPTokenWei, ethBalance, cryptoDevTokenReserve) =>{
    try {
        const contract = new Contract(
            DEX_CONTRACT_ADDRESS,
            DEX_CONTRACT_ABI,
            provider,
        )
        const totalSupply = await contract.totalSupply()

        const _removeEther = ethBalance.mul(removeLPTokenWei).div(totalSupply)

        const _removeCD = cryptoDevTokenReserve.mul(removeLPTokenWei).div(totalSupply)

        return { _removeEther, _removeCD }
    } catch (error) {
        console.error(error);
    }
}