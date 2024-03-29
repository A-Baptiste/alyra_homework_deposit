import { BigNumber } from "ethers";

export function getStringBalanceFromBigNumber(balance: any) {
  const strBalance = balance.toString();
  if(strBalance === "0") { return 0 }
  const truncBalance = strBalance.slice(0, strBalance.length - 15)
  return parseInt(truncBalance) / 1000;
}

export function getPriceFeedInDollar(price: any) {
  if (!price) { return 0; }
  const priceStr = price.toString();
  const units = priceStr.slice(0, 4)
  const fraction = priceStr.slice(5, 9)
  if (fraction === "") {
    return units;
  }
  return `${units} . ${fraction}`;
}

