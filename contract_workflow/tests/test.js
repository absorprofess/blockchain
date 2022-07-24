const path = require('path');
const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
// 1. 配置 provider
const web3 = new Web3(ganache.provider());
// 2. 拿到 abi 和 bytecode
const contractPath = path.resolve(__dirname,
    '../compiled/Voting.json');
const { interface, bytecode } = require(contractPath);

let accounts;
let contract;
const voting = ['0x41', '0x42', '0x43'];
describe('contract', () => {
    // 3. 每次跑单测时需要部署全新的合约实例，起到隔离的作用 
    beforeEach(async () => {
        accounts = await web3.eth.getAccounts();
        console.log('合约部署账户:', accounts[0]);
        contract = await new web3.eth.Contract(JSON.parse(interface)).deploy({ data: bytecode, arguments: [voting] }).send({ from: accounts[0], gas: '1000000' });
        console.log('合约部署成功:', contract.options.address);
    });
    // 4. 编写单元测试
    it('deployed contract', () => {
        assert.ok(contract.options.address);
    });
    it('totalVotesFor', async () => {
        const num = await contract.methods.totalVotesFor('0x41').call();
        console.log(num);
        // assert.equal(brand, voting);
    });

    it('voteForCandidate', async () => {
        await contract.methods.voteForCandidate('0x41')
            .send({ from: accounts[0] });
        const num = await contract.methods.totalVotesFor('0x41').call();
        console.log(num);
        // assert.equal(brand, newBrand);
    });
});