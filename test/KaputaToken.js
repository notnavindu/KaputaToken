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
}) 