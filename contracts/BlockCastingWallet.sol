pragma solidity ^0.4.24;

contract BlockCastingWallet {
    address public owner;
    address public receiver;

    constructor() public {
        owner = msg.sender;
    }
    
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    function deposit() public payable {
        
    }
  
    
    function transfer(uint _value) public returns (bool) {
     require(getBalance() >=_value);
    msg.sender.transfer(_value);
    return true;
    }
}
