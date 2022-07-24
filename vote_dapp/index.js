web3 = new Web3(new Web3.providers.HttpProvider("http://192.168.96.130:8545"));
abi = [{ "constant": true, "inputs": [{ "name": "candidate", "type": "bytes32" }], "name": "totalVotesFor", "outputs": [{ "name": "", "type": "uint8" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "candidate", "type": "bytes32" }], "name": "validCandidate", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "bytes32" }], "name": "votesReceived", "outputs": [{ "name": "", "type": "uint8" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "uint256" }], "name": "candidateList", "outputs": [{ "name": "", "type": "bytes32" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "candidate", "type": "bytes32" }], "name": "voteForCandidate", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "name": "candidateNames", "type": "bytes32[]" }], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }];
contractInstance = new web3.eth.Contract(abi, '0xB09bF1C8B24A6d3E442C2D618965453C0cE93661');
accounts = "";
web3.eth.getAccounts().then(val => {
    accounts = val;
});
candidates = {
    "A": "candidate-1", "B": "candidate-2",
    "C": "candidate-3"
};
function voteForCandidate(candidate) {
    candidateName = $("#candidate").val();
    candidateValue = stringToHex(candidateName);
    account = $("#account").val();
    try {
        contractInstance.methods.voteForCandidate(candidateValue).send(
            { from: account },
            function (error, res) {
                let div_id = candidates[candidateName];
                contractInstance.methods.totalVotesFor(candidateValue).call(function (error, res) {
                    $("#" + div_id).html(
                        res);
                });
            }
        );
    } catch (err) {
        console.log(err);
    }
}

function stringToHex(str) {
    var val = "";
    for (var i = 0; i < str.length; i++) {
        if (val == "")
            val = str.charCodeAt(i).toString(16);
        else
            val += "," + str.charCodeAt(i).toString(16);
    }
    return "0x" + val;
}

async function login() {
    if (typeof window.ethereum !== 'undefined') {
        let addr = await ethereum.request({ method: 'eth_requestAccounts' });//授权连接钱包
        return addr[0];
    } else {
        alert('未安装钱包插件！');
    }
}


$(document).ready(function () {


    accounts.forEach(element => {
        web3.eth.personal.unlockAccount(element, '123456', 15000);
        $('#account').append(new Option(element, element));
    });
    setInterval(function () {
        candidateNames = Object.keys(candidates);
        for (var i = 0; i < candidateNames.length; i++) {
            let name = candidateNames[i];
            contractInstance.methods.totalVotesFor(stringToHex(name)).call(function (error, res) {
                $("#" + candidates[name]).html(res);
            });
        }
    }, 1000);

});