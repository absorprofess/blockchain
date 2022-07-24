// SPDX-License-Identifier: SimPL-2.0
pragma solidity ^0.8.6;

contract Coin {
    mapping(address => uint256) balance;
    uint256 total;

    constructor(uint256 num) {
        balance[msg.sender] = num;
    }

    function send(uint256 num, address _add) public {
        require(balance[msg.sender] - num >= 0);
        require(balance[_add] + num > balance[_add]);
        balance[msg.sender] -= num;
        balance[_add] += num;
    }

    function getBalanc(address _add) public view returns (uint256 _total) {
        return balance[_add];
    }
}
