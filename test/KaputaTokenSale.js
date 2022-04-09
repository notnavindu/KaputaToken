var KaputaTokenSale = artifacts.require("KaputaTokenSale");
var KaputaToken = artifacts.require("KaputaToken");


contract('KaputaTokenSale', (accounts) => {
    let tokenSaleInstance;
    let tokenInstance;
    let tokenPrice = 1000000000000000; // wei
    let buyer = accounts[1];
    let admin = accounts[0]
    let tokensAvailable = 75000;
    let numberOfTokens;


    it('initializes the contract with the correct values', () => {
        return KaputaTokenSale.deployed().then((instance) => {
            tokenSaleInstance = instance
            return tokenSaleInstance.address
        }).then((address) => {
            assert.notEqual(address, 0x0, 'has contract address');
            return tokenSaleInstance.tokenContract();
        }).then((address) => {
            assert.notEqual(address, 0x0, 'has token contract address');
            return tokenSaleInstance.tokenPrice();
        }).then((price) => {
            assert.equal(price, tokenPrice, 'token price is incorrect')
        })
    })

    it('facilitates token buying', () => {
        return KaputaToken.deployed().then(instance => {
            // first get the token instance
            tokenInstance = instance;
            return KaputaTokenSale.deployed()
        }).then((instance) => {
            // token sale instance
            tokenSaleInstance = instance;

            // provition 75% of all tokens to token sale
            return tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, { from: admin })

        }).then((reciept) => {
            numberOfTokens = 10;
            return tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: numberOfTokens * tokenPrice });
        }).then(receipt => {
            assert.equal(receipt.logs.length, 1, 'triggers one event');
            assert.equal(receipt.logs[0].event, 'Sell', 'Should be the Sell event');
            assert.equal(receipt.logs[0].args._buyer, buyer, 'logs the account that purchased the coins');
            assert.equal(receipt.logs[0].args._amount, numberOfTokens, 'logs the correct number of tokens purchased');

            return tokenSaleInstance.tokensSold();
        }).then(amount => {
            assert.equal(amount.toNumber(), numberOfTokens, "increments the number of tokens sold")
            return tokenInstance.balanceOf(buyer);
        }).then((balance) => {
            assert.equal(balance.toNumber(), numberOfTokens, "buys the tokens")
            return tokenInstance.balanceOf(tokenSaleInstance.address);
        }).then((balance) => {
            assert.equal(balance.toNumber(), tokensAvailable - numberOfTokens, "buys the tokens")

            // try to buy tokens different from the ether value
            return tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: 1 });

        }).then(assert.fail).catch(error => {
            assert(error.message.toString().indexOf("revert") >= 0, 'msg.value must equal the correct value of the token')

            // buy more tokens than the supply
            return tokenSaleInstance.buyTokens(90000, { from: buyer, value: 90000 * tokenPrice });
        }).then(assert.fail).catch(error => {
            assert(error.message.toString().indexOf("revert") >= 0, 'cannot buy more tokens than available in the token sale')
        })
    })

    it('ends the token sale', () => {
        return KaputaToken.deployed().then((instance) => {
            // token contract instance
            tokenInstance = instance;

            return KaputaTokenSale.deployed()
        }).then((instance) => {
            // token sale instance
            tokenSaleInstance = instance;

            // non admin try to end the sale
            return tokenSaleInstance.endSale({ from: buyer });
        }).then(assert.fail).catch((error) => {
            assert(error.message.toString().indexOf("revert") >= 0, "must be admin to end the sale");

            // end sale as the admin
            return tokenSaleInstance.endSale({ from: admin });
        }).then(reciept => {

            // tokensale shoudl transfer the remaining tokens to the admin 
            return tokenInstance.balanceOf(admin);
        }).then(balance => {
            assert.equal(balance.toNumber(), 999990, 'returns all unsold $KAPUTAs to the admin');
        })
    })

})