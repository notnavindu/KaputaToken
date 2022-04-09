pragma solidity ^0.8.13;

import "./KaputaToken.sol";

contract KaputaTokenSale {
    address admin;
    KaputaToken public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokensSold;

    event Sell(address _buyer, uint256 _amount);

    constructor(KaputaToken _tokenContract, uint256 _tokenPrice) {
        admin = msg.sender;
        tokenContract = _tokenContract;
        tokenPrice = _tokenPrice;
    }

    // functions like this are implemented in openzeppelin erc20.  this will safely multiple the values
    // but i'm not gonna use it for this
    function multiply(uint256 x, uint256 y) internal pure returns (uint256 z) {
        require(y == 0 || (z = x * y) / y == x);
    }

    // Buying tokens
    function buyTokens(uint256 _numberOfTokens) public payable {
        // require that value is equal to tokens
        require(msg.value == multiply(_numberOfTokens, tokenPrice));

        // require that the contract has enough tokens
        require(tokenContract.balanceOf(address(this)) >= _numberOfTokens);

        // require that a transfer is successful
        require(tokenContract.transfer(msg.sender, _numberOfTokens));

        // keep track of tokensSold
        tokensSold += _numberOfTokens;

        // trigger sell event
        emit Sell(msg.sender, _numberOfTokens);
    }

    // ending the token sale
    function endSale() public {
        // check if admin
        require(msg.sender == admin);

        // transfer remaining okens to admin
        require(
            tokenContract.transfer(
                admin,
                tokenContract.balanceOf(address(this))
            )
        );

        // destroy contract
        payable(admin).transfer(address(this).balance);
    }
}
