pragma solidity ^0.8.13;

contract KaputaToken {
    string public name = "Kaputa Token";
    string public symbol = "KAPUTA";
    string public standard = "Kaputa Token v1.0";

    // Transfer event: fired when tokens are transferred
    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;

    constructor(uint256 _initialSupply) {
        // allocate the initial supply to the owner/admin
        balanceOf[msg.sender] = _initialSupply;

        // set the supply
        totalSupply = _initialSupply;
    }

    // transfer function
    function transfer(address _to, uint256 _value)
        public
        returns (bool success)
    {
        // exception if the account doesnt have enough money
        require(balanceOf[msg.sender] >= _value);

        // transfer the balance
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        // transfer event
        emit Transfer(msg.sender, _to, _value);

        // return a success boolean
        return true;
    }
}
