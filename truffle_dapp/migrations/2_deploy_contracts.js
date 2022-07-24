const TokenVoting = artifacts.require("TokenVoting");

module.exports = function (deployer) {
  deployer.deploy(TokenVoting, 10000, 1000000000000000, ['0x41', '0x42', '0x43'], { gas: 8000000 });
};
