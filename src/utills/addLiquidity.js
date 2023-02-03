import { Contract, utils } from "ethers";
import { DEX_CONTRACT_ABI, DEX_CONTRACT_ADDRESS, CRYPTODEV_CONTRACT_ABI, CRYPTODEV_CONTRACT_ADDRESS } from "../constants";

export const addLiquidity = async(signer, addCDAmountWei, addEthAmountWei) => {
    try {
        const tokenContract = new Contract(
            CRYPTODEV_CONTRACT_ADDRESS,
            CRYPTODEV_CONTRACT_ABI,
            signer
        )

        const exchangeContract = new Contract(
            DEX_CONTRACT_ADDRESS,
            DEX_CONTRACT_ABI,
            signer,
        )

        const tx = await tokenContract.approve(DEX_CONTRACT_ADDRESS, addCDAmountWei.toString());
        await tx.wait();

        tx = await exchangeContract.addLiquidity(addCDAmountWei, {value: addEthAmountWei})
        await tx.wait();
    } catch (error) {
        console.error(error);
    }
}

export const calculateCD = async(_addEther = "0", etherBalanceContract, cdTokenReserve) => {
    try {
        const addEtherAmountWei = utils.parseEther(_addEther)

        const cryptoDevTokenAmmount = (addEtherAmountWei * cdTokenReserve) / (etherBalanceContract)
        return cryptoDevTokenAmmount;
    } catch (error) {
        console.error(error);
    }
}