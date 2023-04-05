import { BigNumber } from "ethers";

export function getStringBalanceFromBigNumber(balance: any) {
  const strBalance = balance.toString();
  const truncBalance = strBalance.slice(0, strBalance.length - 15)
  return parseInt(truncBalance) / 1000;
}
