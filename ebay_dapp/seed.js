Eutil = require('ethereumjs-util');
EcommerceStore = artifacts.require("./EcommerceStore.sol");
module.exports = function (callback) {
    current_time = Math.round(new Date() / 1000);
    amt_1 = web3.utils.toWei('1', 'ether');
    EcommerceStore.deployed().then(function (i) { i.addProductToStore('iphone 5', 'Cell Phones & Accessories', 'QmQgvK8BU8j17NLsqz63u4YEb3Efy3Nf6LY8WitNCbUrb9', 'QmbLRFj5U6UGTy3o9Zt8jEnVDuAw2GKzvrrv3RED9wyGRk', current_time, current_time + 200, (2 * amt_1) + "", 0).then(function (f) { console.log(f) }) });
    EcommerceStore.deployed().then(function (i) { i.addProductToStore('iphone 5s', 'Cell Phones & Accessories', 'QmQgvK8BU8j17NLsqz63u4YEb3Efy3Nf6LY8WitNCbUrb9', 'QmbLRFj5U6UGTy3o9Zt8jEnVDuAw2GKzvrrv3RED9wyGRk', current_time, current_time + 400, (3 * amt_1) + "", 1).then(function (f) { console.log(f) }) });
    EcommerceStore.deployed().then(function (i) { i.addProductToStore('iphone 6', 'Cell Phones & Accessories', 'QmQgvK8BU8j17NLsqz63u4YEb3Efy3Nf6LY8WitNCbUrb9', 'QmbLRFj5U6UGTy3o9Zt8jEnVDuAw2GKzvrrv3RED9wyGRk', current_time, current_time + 14, amt_1 + "", 0).then(function (f) { console.log(f) }) });
    EcommerceStore.deployed().then(function (i) { i.addProductToStore('iphone 6s', 'Cell Phones & Accessories', 'QmQgvK8BU8j17NLsqz63u4YEb3Efy3Nf6LY8WitNCbUrb9', 'QmbLRFj5U6UGTy3o9Zt8jEnVDuAw2GKzvrrv3RED9wyGRk', current_time, current_time + 86400, (4 * amt_1) + "", 1).then(function (f) { console.log(f) }) });
    EcommerceStore.deployed().then(function (i) { i.addProductToStore('iphone 7', 'Cell Phones & Accessories', 'QmQgvK8BU8j17NLsqz63u4YEb3Efy3Nf6LY8WitNCbUrb9', 'QmbLRFj5U6UGTy3o9Zt8jEnVDuAw2GKzvrrv3RED9wyGRk', current_time, current_time + 86400, (5 * amt_1) + "", 1).then(function (f) { console.log(f) }) });
    EcommerceStore.deployed().then(function (i) { i.addProductToStore('Jeans', 'Clothing, Shoes & Accessories', 'QmQgvK8BU8j17NLsqz63u4YEb3Efy3Nf6LY8WitNCbUrb9', 'QmbLRFj5U6UGTy3o9Zt8jEnVDuAw2GKzvrrv3RED9wyGRk', current_time, current_time + 86400 + 86400 + 86400, (5 * amt_1) + "", 1).then(function (f) { console.log(f) }) });
    EcommerceStore.deployed().then(function (i) { i.productIndex.call().then(function (f) { console.log(f) }) });
    //EcommerceStore.deployed().then(function (i) { i.getProduct.call(9).then(function (f) { console.log(f) }) })
}