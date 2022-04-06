var KaputaToken = artifacts.require("KaputaToken");

contract('KaputaToken', (accounts) => {
    it('sets the total supply upon deployement', () => {
        return KaputaToken.deployed().then((instance) => {
            tokenInstance = instance;
            return tokenInstance.totalSupply();
        }).then((totalSupply) => {
            assert.equal(totalSupply.toNumber(), 1000000, 'sets total supply to 1,000,000')
        })
    })
})