var KaputaToken = artifacts.require("KaputaToken");

contract('KaputaToken', (accounts) => {
    let tokenInstance;

    it('initializes the contract with the correct values', () => {
        return KaputaToken.deployed().then((instance) => {
            tokenInstance = instance;
            return tokenInstance.name();
        }).then(name => {
            assert.equal(name, 'Kaputa Token', 'has the correct name')
            return tokenInstance.symbol();
        }).then((symbol) => {
            assert.equal(symbol, "KAPUTA", "has the correct symbol");
            return tokenInstance.standard();
        }).then((standard) => {
            assert.equal(standard, "Kaputa Token v1.0", "Has the correct standard")
        })
    })

    it('sets the total supply upon deployement', () => {
        return KaputaToken.deployed().then((instance) => {
            tokenInstance = instance;
            return tokenInstance.totalSupply();
        }).then((totalSupply) => {
            assert.equal(totalSupply.toNumber(), 1000000, 'sets total supply to 1,000,000');
            return tokenInstance.balanceOf(accounts[0])
        }).then((adminBalance) => {
            assert.equal(adminBalance.toNumber(), 1000000, 'it allocates the initial supply to the admin')
        })
    })

    // tranfer funciton tests
    it('transfers token ownership', () => {
        return KaputaToken.deployed().then((instance) => {
            tokenInstance = instance;

            // transfer something larger than available
            return tokenInstance.transfer.call(accounts[1], 99999999999999999999)
        }).then(assert.fail).catch((err) => {
            assert(err.message, "Not throwing an error");
            return tokenInstance.transfer(accounts[1], 5000, { from: accounts[0] })
        }).then((reciept) => {
            assert.equal(reciept.logs.length, 1, 'triggers one event');
            assert.equal(reciept.logs[0].event, 'Transfer', 'Should be the TRANFER event');
            assert.equal(reciept.logs[0].args._from, accounts[0], 'logs the account transferred from');
            assert.equal(reciept.logs[0].args._to, accounts[1], 'logs the account transferred to');
            assert.equal(reciept.logs[0].args._value, 5000, 'correct value is transfered');

            return tokenInstance.balanceOf(accounts[1]);
        }).then((balance) => {
            assert.equal(balance.toNumber(), 5000, "adds the amount to the reciever")
            return tokenInstance.balanceOf(accounts[0]);
        }).then(balance => {
            assert.equal(balance.toNumber(), 995000, "substracts the amount from the sender")
        })
    })

    // approve function
    it('approves tokens for delegated transfer', () => {
        return KaputaToken.deployed().then((instance) => {
            tokenInstance = instance;

            return tokenInstance.approve.call(accounts[1], 100, { from: accounts[0] });
        }).then((success) => {
            assert.equal(success, true, 'it return true');

            return tokenInstance.approve(accounts[1], 100, { from: accounts[0] });
        }).then((reciept) => {
            assert.equal(reciept.logs.length, 1, 'triggers one event');
            assert.equal(reciept.logs[0].event, 'Approval', 'Should be the APPROVAL event');
            assert.equal(reciept.logs[0].args._owner, accounts[0], 'logs the account the token authorized by');
            assert.equal(reciept.logs[0].args._spender, accounts[1], 'logs the account the tokens authored to');
            assert.equal(reciept.logs[0].args._value, 100, 'correct value is approved');

            return tokenInstance.allowance(accounts[0], accounts[1]);
        }).then((allowance) => {
            assert.equal(allowance, 100, "stores the allowance for delegated transfer")
        })
    })

    // treansfer from
    it('handles delegated token transfers', () => {
        return KaputaToken.deployed().then((instance) => {
            tokenInstance = instance;
            fromAccount = accounts[2];
            toAccount = accounts[3];
            spendingAccount = accounts[4];

            // transfer tokens to fromAccount
            return tokenInstance.transfer(fromAccount, 100, { from: accounts[0] })
        }).then(reciept => {
            // approve spendingAccount to spend 10 accounts from fromAccount
            return tokenInstance.approve(spendingAccount, 10, { from: fromAccount });
        }).then(reciept => {
            // transfer token more than senders balance;
            return tokenInstance.transferFrom(fromAccount, toAccount, 999, { from: spendingAccount });
        }).then(assert.fail).catch(err => {
            assert(err.message.toString().indexOf('revert') >= 0, "cannot transfer value larger than balance")

            // Transfer token more than the approved amount
            return tokenInstance.transferFrom(fromAccount, toAccount, 20, { from: spendingAccount });
        }).then(assert.fail).catch(err => {
            assert(err.message.toString().indexOf('revert') >= 0, "cannot transfer value larger than approved amount")

            // check if returns true
            return tokenInstance.transferFrom.call(fromAccount, toAccount, 10, { from: spendingAccount })
        }).then(success => {
            assert.equal(success, true, "return true after successfull transfer")

            return tokenInstance.transferFrom(fromAccount, toAccount, 10, { from: spendingAccount })
        }).then(reciept => {
            assert.equal(reciept.logs.length, 1, 'triggers one event');
            assert.equal(reciept.logs[0].event, 'Transfer', 'Should be the TRANFER event');
            assert.equal(reciept.logs[0].args._from, fromAccount, 'logs the account transferred from');
            assert.equal(reciept.logs[0].args._to, toAccount, 'logs the account transferred to');
            assert.equal(reciept.logs[0].args._value, 10, 'correct value is transfered');

            return tokenInstance.balanceOf(fromAccount)
        }).then(balance => {
            assert.equal(balance.toNumber(), 90, 'deducts the tokens from the fromAccount')

            return tokenInstance.balanceOf(toAccount)
        }).then(balance => {
            assert.equal(balance.toNumber(), 10, 'add the tokens to the toAccount');

            return tokenInstance.allowance(fromAccount, spendingAccount)
        }).then(allowance => {
            assert.equal(allowance.toNumber(), 0, 'deducts the amount from allowance')
        })
    })
}) 