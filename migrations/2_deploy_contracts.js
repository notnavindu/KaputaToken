const KaputaToken = artifacts.require("KaputaToken");

module.exports = function (deployer) {
    deployer.deploy(KaputaToken);
};
