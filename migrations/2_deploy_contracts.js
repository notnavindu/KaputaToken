const KaputaToken = artifacts.require("KaputaToken");

module.exports = function (deployer) {
    deployer.deploy(KaputaToken, 1000000); // pass additional arguments to constructor
};
