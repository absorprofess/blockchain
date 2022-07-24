var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider("http://192.168.96.130:8545"));

var abi = [{ "constant": true, "inputs": [{ "name": "", "type": "address" }], "name": "balances", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "num", "type": "uint256" }, { "name": "_add", "type": "address" }], "name": "add", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "_add", "type": "address" }], "name": "getBalanc", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "num", "type": "uint256" }, { "name": "_add", "type": "address" }], "name": "send", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "_add", "type": "address" }, { "indexed": false, "name": "num", "type": "uint256" }], "name": "Add", "type": "event" }];
var MyContract = web3.eth.contract(abi);
//0xa428ca95c4255ffc540cc12a93f1548dfe55fe97

var contractInstance = MyContract.at("0xa428ca95c4255ffc540cc12a93f1548dfe55fe97");


//var byteData = "0x608060405234801561001057600080fd5b5061046e806100206000396000f300608060405260043610610062576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806327e235e3146100675780632b8bbbe8146100be57806331e31e961461010b578063785d04f514610162575b600080fd5b34801561007357600080fd5b506100a8600480360381019080803573ffffffffffffffffffffffffffffffffffffffff1690602001909291905050506101af565b6040518082815260200191505060405180910390f35b3480156100ca57600080fd5b5061010960048036038101908080359060200190929190803573ffffffffffffffffffffffffffffffffffffffff1690602001909291905050506101c7565b005b34801561011757600080fd5b5061014c600480360381019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610282565b6040518082815260200191505060405180910390f35b34801561016e57600080fd5b506101ad60048036038101908080359060200190929190803573ffffffffffffffffffffffffffffffffffffffff1690602001909291905050506102ca565b005b60006020528060005260406000206000915090505481565b7f2728c9d3205d667bbc0eefdfeda366261b4d021949630c047f3e5834b30611ab8183604051808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018281526020019250505060405180910390a1816000808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825401925050819055505050565b60008060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b6000826000803373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054031015151561031a57600080fd5b6000808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054826000808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054011115156103a657600080fd5b816000803373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282540392505081905550816000808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828254019250508190555050505600a165627a7a723058205b757b331cee6a3cb93a1dc8daf271feb9abf121751af790017d1ee5278404520029"

//var objData = { from: web3.eth.accounts[0], data: byteData, gas: 1000000 }

//var contractInstance = MyContract.new(objData);


web3.personal.unlockAccount(web3.eth.accounts[0], "123456", (err, res) => {
    if (err) {
        console.log(err);
    } else {
        console.log(res);
        contractInstance.add(1000, web3.eth.accounts[0], { from: web3.eth.accounts[0] }, (res, err) => {
            if (err)
                console.log(err);
            else
                console.log(res);
        });
    }
});






// contractInstance.Add("latest", (err, res) => {
//     if (err)
//         console.log(err);
//     else
//         console.log(res.toString());
// })

// contractInstance.getBalanc(web3.eth.accounts[1], (err, res) => {
//     if (err)
//         console.log(err);
//     else
//         console.log(res.toString());
// });
