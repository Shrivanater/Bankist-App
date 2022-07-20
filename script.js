'use strict';

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  transactions: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  transactionDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2022-07-01T23:36:17.929Z',
    '2022-07-03T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  transactions: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  transactionDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2022-07-02T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// Elements
const labelMsg = document.querySelector('.msg');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance-amt');
const labelSumIn = document.querySelector('.summary-in');
const labelSumOut = document.querySelector('.summary-out');
const labelSumInterest = document.querySelector('.summary-interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerTransactions = document.querySelector('.transactions');

const btnLogin = document.querySelector('.login-btn');
const btnTransfer = document.querySelector('.transfer-btn');
const btnLoan = document.querySelector('.loan-btn');
const btnClose = document.querySelector('.close-btn');
const btnSort = document.querySelector('.sort-btn');

const inputLoginUsername = document.querySelector('.login-user');
const inputLoginPin = document.querySelector('.login-pin');
const inputTransferTo = document.querySelector('.transfer-acc');
const inputTransferAmount = document.querySelector('.transfer-amt');
const inputLoanAmount = document.querySelector('.loan-amt');
const inputCloseUsername = document.querySelector('.close-user');
const inputClosePin = document.querySelector('.close-pin');

//Create usernames
const createUsernames = function (accounts) {
  accounts.forEach(function(acc){
    acc.username = acc.owner
    .toLowerCase()
    .split(' ')
    .map(part => part[0])
    .join('');
  }) 
}
createUsernames(accounts);

//Format Dates
const formatTransactionDate = function(date, locale){
  const calcDaysSince = (date1, date2) => Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
  const daysSince = calcDaysSince(new Date(), date);

  if(daysSince === 0)
    return 'Today'
  if(daysSince === 1)
    return 'Yesterday'
  if(daysSince <= 7)
    return `${daysSince} days ago`;
  else{
    // const day = `${date.getDate()}`.padStart(2, 0);
    // const month = `${date.getMonth() + 1}`.padStart(2, 0);
    // const year = date.getFullYear();
    // return `${day}/${month}/${year}`;

    return new Intl.DateTimeFormat(locale).format(date);
  }
}

//Format Currency
const formatCurrency = function(acc, value){
  return new Intl.NumberFormat(acc.locale, {
    style: 'currency',
    currency: acc.currency,
  }).format(value);
}

//Display Transactions
const displayTransactions = function(acc, sort){
  containerTransactions.innerHTML = '';
  const trs = sort ? acc.transactions.slice().sort((a, b) => a - b) : acc.transactions;
  const dts = sort ? acc.transactionDates.slice().sort((a, b) => a - b) : acc.transactionDates;
 
  trs.forEach(function(tr, i){
    const type = tr > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(dts[i])
    const displayDate = formatTransactionDate(date, acc.locale);

    const html = `
      <div class = "transactions-row">
        <div class = "transactions-type transactions-type-${type}">${i+1} ${type.toUpperCase()}</div>
        <div class = "transactions-date">${displayDate}</div>
        <div class = "transactions-amt">${formatCurrency(acc, tr)}</div>
      </div>
    `;

    containerTransactions.insertAdjacentHTML('afterbegin', html);
  }); 
}

//Display Balance
const calcDisplayBalance = function(acc){
  acc.balance = acc.transactions.reduce((acc, tr) => acc + tr, 0);
  const formattedBalance = formatCurrency(acc, acc.balance)
  labelBalance.textContent = `${formattedBalance}`;
}

//Dsiplay Summary
const calcDisplaySummary = function (acc) {
  const income = acc.transactions.filter(tr => tr > 0).reduce((acc, tr) => acc + tr, 0);
  labelSumIn.textContent = `${formatCurrency(acc, income)}`

  const loss = acc.transactions.filter(tr => tr < 0).reduce((acc, tr) => acc + tr, 0);
  labelSumOut.textContent = `${formatCurrency(acc, Math.abs(loss))}`

  const interest = acc.transactions.filter(tr => tr > 0)
                                   .map(deposit => deposit * acc.interestRate/100)
                                   .filter(interest => interest > 1)
                                   .reduce((acc, interest) => acc + interest, 0);
  labelSumInterest.textContent = `${formatCurrency(acc, interest)}`;
}

//Update UI Function
const updateUI = function(acc) {
  displayTransactions(acc);
  calcDisplayBalance(acc);
  calcDisplaySummary(acc);
}

//Logout Timer
const startLogoutTimer = function() {
  let time = 300;

  const tick = function() {
    const minutes = String(Math.trunc(time / 60)).padStart(2, 0);
    const seconds = String(time % 60).padStart(2, 0);

    labelTimer.textContent = `${minutes}:${seconds}`;
  
    if(time === 0){
      clearInterval(timer);
      labelMsg.textContent = 'Log in to Get Started';
      containerApp.classList.remove('active');
    }
    time--;
  };
  

  tick();
  const timer = setInterval(tick, 1000);
  return timer;
}

//Login
let currAcc, timer;

//Default for testing
// currAcc = account1;
// updateUI(currAcc)
// containerApp.classList.add('active');

btnLogin.addEventListener('click', function(e) {
  e.preventDefault();

  currAcc = accounts.find(acc => acc.username === inputLoginUsername.value);
  if(currAcc?.pin === Number(inputLoginPin.value)){
    labelMsg.textContent = `Welcome back, ${currAcc.owner.split(' ')[0] }`;
    containerApp.classList.add('active');

    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    };
    const locale = navigator.language;
    labelDate.textContent = new Intl.DateTimeFormat(currAcc.locale, options).format(now);

    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    if(timer)
      clearInterval(timer);
    timer = startLogoutTimer();

    updateUI(currAcc);
  }
});

//Transfers
btnTransfer.addEventListener('click', function(e){
  e.preventDefault();

  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(acc => acc.username === inputTransferTo.value);

  if(amount > 0 && currAcc.balance > amount && receiverAcc && currAcc.username !== receiverAcc.username){
    currAcc.transactions.push(-amount);
    currAcc.transactionDates.push(new Date().toISOString());
    receiverAcc.transactions.push(amount);
    receiverAcc.transactionDates.push(new Date().toISOString());

    updateUI(currAcc);

    inputTransferAmount.value = inputTransferTo.value = '';
    clearInterval(timer);
    timer = startLogoutTimer();
  }
});

//Loans
btnLoan.addEventListener('click', function(e){
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);
  if(amount > 0 && currAcc.transactions.some(tr => tr >= 0.1 * amount)){
    setTimeout(function() {
      currAcc.transactions.push(amount);
      currAcc.transactionDates.push(new Date().toISOString());
      updateUI(currAcc);
    }, 2500);
  }

  inputLoanAmount.value = '';
  clearInterval(timer);
  timer = startLogoutTimer();
});

//Close
btnClose.addEventListener('click', function(e){
  e.preventDefault();

  if(inputCloseUsername.value === currAcc.username && Number(inputClosePin.value) === currAcc.pin){
    const index = accounts.findIndex(acc => acc.username === currAcc.username);
    accounts.splice(index, 1);
    containerApp.classList.remove('active');
  }

  inputClosePin.value = inputCloseUsername.value = '';
});

//Sort Transactions
btnSort.addEventListener('click', function(e){
  e.preventDefault();

  if(btnSort.value === 'OFF'){
    currAcc.transactionsSorted = currAcc.transactions.slice().sort((a, b) => {
      return a-b;
    })
    displayTransactions(currAcc, 1);
    btnSort.value = 'ON';
  }
  else{
    displayTransactions(currAcc, 0);
    btnSort.value = 'OFF'
  }
});

//STUFF

// labelBalance.addEventListener('click', function(){
//   [...document.querySelectorAll('.transactions-row')].
//   forEach(function(row, i){
//     if(i % 2 == 0)
//       row.style.backgroundColor = 'orangered';
//   });
// })

//Dates
// console.log(new Date(account1.transactionDates[0]));
// console.log(new Date(3 * 24 * 60 * 60 * 1000));

// const future = new Date(2037, 10, 19, 15, 23);
// console.log(future);
// console.log(future.getFullYear());
// console.log(future.getMonth());
// console.log(future.toISOString());

// console.log(Date.now());

