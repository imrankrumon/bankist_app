/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

const account1 = {
    owner: 'Jonas Schmedtmann',
    movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
    interestRate: 1.2, // %
    pin: 1111,
  
    movementsDates: [
      '2020-01-25T14:18:46.235Z',
      '2020-02-05T16:33:06.386Z',
      '2021-07-25T14:43:26.374Z',
      '2021-07-28T18:49:59.371Z',
      '2021-07-30T05:01:20.894Z',
      '2021-08-22T13:15:33.035Z',
      '2021-08-26T09:48:16.867Z',
      '2021-08-27T06:04:23.907Z',
    ],
    currency: 'EUR',
    locale: 'pt-PT', // de-DE
  };
  
const account2 = {
    owner: 'Jessica Davis',
    movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
    interestRate: 1.5,
    pin: 2222,
  
    movementsDates: [
      '2019-11-01T13:15:33.035Z',
      '2019-11-30T09:48:16.867Z',
      '2019-12-25T06:04:23.907Z',
      '2020-01-25T14:18:46.235Z',
      '2020-02-05T16:33:06.386Z',
      '2021-07-25T14:43:26.374Z',
      '2021-07-28T18:49:59.371Z',
      '2021-07-30T05:01:20.894Z',
    ],
    currency: 'USD',
    locale: 'en-US',
  };
  
const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const btnLogin = document.querySelector('.login__btn');
const btnSort = document.querySelector('.btn--sort');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');

// Functions
const createUsernames = function (accounts) {
    accounts.forEach(function (account) {
        account.username = account.owner.toLowerCase().split(' ').map(name => name[0]).join('');
    })
}

createUsernames(accounts);

const formatMovementDate = function (date, locale) {
    const calcDaysPassed = (date1, date2) => Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
    const daysPassed = calcDaysPassed(new Date(), date);

    if (daysPassed === 0) return 'Today';
    if (daysPassed === 1) return 'Yesterday';
    if (daysPassed <= 7) return `${daysPassed} days ago`;

    return Intl.DateTimeFormat(locale).format(date);
}

const formatCur = function (value, locale, currency) {
    return Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
    }).format(value);
}

const displayMovements = function (account, sort = false) {
    // empty the container
    containerMovements.innerHTML = '';

    // display movements
    const movs = sort ? account.movements.slice().sort((a, b) => a - b) : account.movements;

    movs.forEach(function (mov, i) {
        const type = mov > 0 ? 'deposit' : 'withdrawal';
        const date = new Date(account.movementsDates[i]);
        const displayDate = formatMovementDate(date, account.locale);
        const formattedMov = formatCur(mov, account.locale, account.currency);

        const html = 
            `<div class="movements__row">
                <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
                <div class="movements__date">${displayDate}</div>
                <div class="movements__value">${formattedMov}</div>
            </div>`;

        containerMovements.insertAdjacentHTML('afterbegin', html);
    })
}

const calcDisplayBalance = function (account) {
    account.balance = account.movements.reduce((acc, mov) => acc + mov, 0);

    labelBalance.textContent = formatCur(account.balance, account.locale, account.currency);
}

const calcDisplaySummary = function (account) {
    // incomes
    const incomes = account.movements.filter(mov => mov > 0).reduce((acc, deposit) => acc + deposit, 0);

    labelSumIn.textContent = formatCur(incomes, account.locale, account.currency);

    // outgoings
    const out = account.movements.filter(mov => mov < 0).reduce((acc, withdrawal) => acc + withdrawal, 0);

    labelSumOut.textContent = formatCur(Math.abs(out), account.locale, account.currency);

  // Interest --- Bank Rule: if interest not >= 1, don't add it
     const interest = account.movements.filter(mov => mov > 0).map(deposit => (deposit * account.interestRate) / 100).reduce((acc, int) => int >= 1 ? acc + int : acc, 0);

     labelSumInterest.textContent = formatCur(interest, account.locale, account.currency);    
}

const updateUI = function (account) {
    displayMovements(account);
    calcDisplayBalance(account);
    calcDisplaySummary(account);
}

const startLogOutTimer = function () {
    // set time
    let time = 300;

    // the call back function
    const tick = function () {
        // Convert time to min and sec
        const min = String(Math.trunc(time / 60)).padStart(2, 0);
        const sec = String(time % 60).padStart(2, 0);

        // display time every second
        labelTimer.textContent = `${min}:${sec}`;
        
        // whe time is 0, logout
        if (time === 0) {
            clearInterval(timer);
            // Display Message Login Again
            labelWelcome.textContent = `Log in to get started!`;
        
            // Hide UI
            containerApp.style.opacity = 0;
        }

        // decrease time 1s
        time--;
    }

    // call the fucntion every second
    tick();
    const timer = setInterval(tick, 1000);

    return timer;
}

// Events
let currentAccount, timer;

btnLogin.addEventListener('click', function (e) {
    e.preventDefault();

    // check correct username and pin
    currentAccount = accounts.find(account => inputLoginUsername.value === account.username);

    if (currentAccount?.pin === Number(inputLoginPin.value)) {
        // Display welcome message
        labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(' ')[0]}!`;

        // Display UI
        containerApp.style.opacity = 100;

        // update current balance date
        const now = new Date();
        const options = {
            hour: 'numeric',
            minute: 'numeric',
            seconds: 'numeric',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }
        
        labelDate.textContent = Intl.DateTimeFormat(currentAccount.locale, options).format(now);

        // clear inputs and change focus
        inputLoginUsername.value = inputLoginPin.value = '';
        inputLoginPin.blur();
        
        // update UI
          updateUI(currentAccount);

        // Timer
        if (timer) clearInterval(timer);
        timer = startLogOutTimer();
    } else {
        // Display message try again
        labelWelcome.textContent = `Try Again! Wrong Account or Password!`;

        // Hide UI
        containerApp.style.opacity = 0;
    }
})

// TRANSFER ---
btnTransfer.addEventListener('click', function (e) {
    e.preventDefault();

    const amount = Number(inputTransferAmount.value);
    const receiverAcc = accounts.find(account => account.username === inputTransferTo.value);

    if (amount > 0 && amount <= currentAccount.balance && receiverAcc && receiverAcc?.username !== currentAccount.username) {
        // adding tranfer amount and date to receiver account
        receiverAcc.movements.push(amount);
        receiverAcc.movementsDates.push(new Date().toISOString());

        // adding tranfer amount and date to current account 
        currentAccount.movements.push(-amount);
        currentAccount.movementsDates.push(new Date().toISOString());

        // update UI
        updateUI(currentAccount);

        // reset timer
        if (timer) clearInterval(timer);
        timer = startLogOutTimer();
    }

    // clear inputs and change focus
    inputTransferAmount.value = inputTransferTo.value = '';
    inputTransferTo.focus();
})

// LOAN ---
btnLoan.addEventListener('click', function (e) {
    e.preventDefault();

    const loanAmount = Math.floor(Number(inputLoanAmount.value));

    if (loanAmount > 0 && currentAccount.movements.some(mov => mov >= loanAmount * 0.1)) {
        setTimeout(function () {
            // add movements
            currentAccount.movements.push(loanAmount);

            // add movement date
            currentAccount.movementsDates.push(new Date().toISOString());

            // update UI
            updateUI(currentAccount);

            // reset timer
            if (timer) clearInterval(timer);
            timer = startLogOutTimer();
        }, 2500)
    }

    inputLoanAmount.value = '';
})

// CLOSE ACCOUNT ---
btnClose.addEventListener('click', function (e) {
    e.preventDefault();

    if (inputCloseUsername.value === currentAccount.username && Number(inputClosePin.value) === currentAccount.pin) {
        const index = accounts.findIndex(account => account.username === currentAccount.username);

        // Delete Account
        accounts.splice(index, 1);

        // Hide UI
        containerApp.style.opacity = 0;

        // update welcome message
        labelWelcome.textContent = `${currentAccount.owner.split(' ')[0]}'s account closed! Log in another account to get started`;
    }

      // Clear inputs
      inputCloseUsername.value = inputClosePin.value = '';
      inputCloseUsername.focus();
})

// SORTING 
let sorted = false;

btnSort.addEventListener('click', function (e) {
    e.preventDefault();

    displayMovements(currentAccount, !sorted);

    sorted = !sorted;
})