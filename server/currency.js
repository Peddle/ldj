const STARTING_CURRENCY = 100;
let totalCurrency = 0;
const BASE_PERCENT = 0.01;
const balances = {};

const initAccount = (id) => {
  if(balances[id]) totalCurrency -= balances[id];
  balances[id] = STARTING_CURRENCY;
  totalCurrency += STARTING_CURRENCY;
};

const getBalance = (id) => {
  return balances[id];
}

const getTotalCurrency = () => {
  return totalCurrency;
};

const deleteAccount = (id) => {
  totalCurrency -= balances[id];
  balances[id] = 0;
};

const debitUpgrade = (index, lvl) => {
  cost = Math.floor(lvl*BASE_PERCENT*totalCurrency) + 1;
  if(balances[index] > cost){
    balances[index] -= cost;
    totalCurrency -= cost;
    return true;
  }
  return false;
}

const transfer = (source, target) => {
  balances[target] += balances[source];
  balances[source] = 0;
}
 

module.exports = {
  initAccount,
  getBalance,
  getTotalCurrency,
  deleteAccount,
  debitUpgrade,
  transfer,
}
