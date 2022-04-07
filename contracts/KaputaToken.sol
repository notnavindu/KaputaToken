pragma solidity ^0.8.13;

contract KaputaToken {
    string public name = "Kaputa Token";
    string public symbol = "KAPUTA";
    string public standard = "Kaputa Token v1.0";

    // Transfer event: fired when tokens are transferred
    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    // Approve event
    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

    // total supply of tokens
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf; // Account balances
    mapping(address => mapping(address => uint256)) public allowance; // Allowances

    constructor(uint256 _initialSupply) {
        // allocate the initial supply to the owner/admin
        balanceOf[msg.sender] = _initialSupply;

        // set the supply
        totalSupply = _initialSupply;
    }

    // transfer tokens
    function transfer(address _to, uint256 _value)
        public
        returns (bool success)
    {
        // exception if the account doesnt have enough money
        require(balanceOf[msg.sender] >= _value);

        // transfer the balance
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        // transfer event  (this is a must for erc-20)
        emit Transfer(msg.sender, _to, _value);

        // return a success boolean
        return true;
    }

    // approve
    function approve(address _spender, uint256 _value)
        public
        returns (bool success)
    {
        allowance[msg.sender][_spender] = _value;

        // emit the Approve event
        emit Approval(msg.sender, _spender, _value);

        return true;
    }

    // transferfrom
    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) public returns (bool sucess) {
        // require _from has enough tokens
        require(_value <= balanceOf[_from]);

        // require allowance is big enough
        require(_value <= allowance[_from][msg.sender]);

        // change the balance (actual tranfer)
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;

        // update the allowance
        allowance[_from][msg.sender] -= _value;

        // emit the transfer event
        emit Transfer(_from, _to, _value);

        // return success
        return true;
    }
}
