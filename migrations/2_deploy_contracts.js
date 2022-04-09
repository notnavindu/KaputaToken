const KaputaToken = artifacts.require("KaputaToken");
const KaputaTokenSale = artifacts.require("KaputaTokenSale");

module.exports = function (deployer) {
    deployer.deploy(KaputaToken, 1000000).then(() => {
        return deployer.deploy(KaputaTokenSale, KaputaToken.address, 1000000000000000);
    });
};
