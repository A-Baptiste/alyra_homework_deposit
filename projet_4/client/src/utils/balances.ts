import { BigNumber } from "ethers";

export function getStringBalanceFromBigNumber(balance: any) {
  const strBalance = balance.toString();
  const truncBalance = strBalance.slice(0, strBalance.length - 15)
  return parseInt(truncBalance) / 1000;
}

export function getPriceFeedInDollar(price: any) {
  const priceStr = price.data.toString();
  const units = priceStr.slice(0, 4)
  const fraction = priceStr.slice(5, 9)
  if (fraction === "") {
    return units;
  }
  return `${units} . ${fraction}`;
}

