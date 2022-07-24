import Web3 from "web3";
import metaCoinArtifact from "../../build/contracts/EcommerceStore.json";


const ipfsAPI = require('ipfs-api');
const ethUtil = require('ethereumjs-util');

const ipfs = ipfsAPI({ host: '127.0.0.1', port: '5001', protocol: 'http' });

const App = {
  web3: null,
  account: null,
  meta: null,

  start: async function () {
    const { web3 } = this;

    try {
      // get contract instance
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = metaCoinArtifact.networks[networkId];
      this.meta = new web3.eth.Contract(
        metaCoinArtifact.abi,
        deployedNetwork.address,
      );
      // get accounts
      const accounts = await web3.eth.getAccounts();
      this.account = accounts[0];


    } catch (error) {
      console.error("Could not connect to contract or chain.");
    }

    renderStore();
    const { NewProduct } = App.meta.events;
    const productEvent = NewProduct({ fromBlock: 0, toBlock: 'latest' }, function (err, result) {
      if (err) {
        console.log(err)
        return;
      }
      console.log(result.returnValues);
      //saveProduct(result.args);
    });

    if ($("#product-details").length > 0) {
      //This is product details page
      let productId = new URLSearchParams(window.location.search).get('id');
      renderProductDetails(productId);
    }
    var reader;
    $("#product-image").change(function (event) {
      const file = event.target.files[0];
      reader = new window.FileReader();
      reader.readAsArrayBuffer(file);
    });


    $("#add-item-to-store").submit(function (event) {
      const req = $("#add-item-to-store").serialize();
      let params = JSON.parse('{"' + req.replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}');
      let decodedParams = {}
      Object.keys(params).forEach(function (v) {
        decodedParams[v] = decodeURIComponent(decodeURI(params[v]));
      });
      saveProduct(reader, decodedParams);
      event.preventDefault();
    });

    //提交竞价
    $("#bidding").submit(function (event) {
      $("#msg").hide();
      let amount = $("#bid-amount").val();
      let sendAmount = $("#bid-send-amount").val();
      let secretText = $("#secret-text").val();
      let sealedBid = web3.utils.sha3(web3.utils.toWei(amount + "", 'ether') + secretText).toString('hex');
      let productId = $("#product-id").val();
      console.log(sealedBid + " for " + productId);

      const { bid } = App.meta.methods;
      bid(parseInt(productId), sealedBid).send({ value: web3.utils.toWei(sendAmount + "", 'ether'), from: App.account, gas: 440000 }).then(
        function (f) {
          $("#msg").html("Your bid has been successfully submitted!");
          $("#msg").show();
          console.log(f)
        }
      )
      event.preventDefault();
    });

    //揭示报价
    $("#revealing").submit(function (event) {
      $("#msg").hide();
      let amount = $("#actual-amount").val();
      let secretText = $("#reveal-secret-text").val();
      let productId = $("#product-id").val();
      console.log(productId);
      console.log(web3.utils.toWei(amount).toString());
      console.log(secretText);
      console.log(App.account);
      const { revealBid } = App.meta.methods;
      revealBid(parseInt(productId), web3.utils.toWei(amount).toString(), secretText).send({ from: App.account, gas: 440000 }).then(
        function (f) {
          $("#msg").show();
          $("#msg").html("Your bid has been successfully revealed!");
          console.log(f)
        }
      )
      event.preventDefault();
    });

    //最终公布结果
    $("#finalize-auction").submit(function (event) {
      $("#msg").hide();
      let productId = $("#product-id").val();
      const { finalizeAuction } = App.meta.methods;
      finalizeAuction(parseInt(productId)).send({ from: App.account, gas: 4400000 }).then(
        function (f) {
          $("#msg").show();
          $("#msg").html("The auction has been finalized and winner declared.");
          console.log(f)
          location.reload();
        }
      ).catch(function (e) {
        console.log(e);
        $("#msg").show();
        $("#msg").html("The auction can not be finalized by the buyer or seller, only a third party aribiter can finalize it");
      })
      event.preventDefault();
    });

    //发货
    $("#release-funds").click(function () {
      let productId = new URLSearchParams(window.location.search).get('id');
      const { releaseAmountToSeller } = App.meta.methods;
      $("#msg").html("Your transaction has been submitted. Please wait for few seconds for the confirmation").show();
      console.log(productId);
      releaseAmountToSeller(productId).send({ from: App.account, gas: 4400000 }).then(function (f) {
        console.log(f);
        location.reload();
      }).catch(function (e) {
        console.log(e);
      })
    });

    //退款
    $("#refund-funds").click(function () {
      let productId = new URLSearchParams(window.location.search).get('id');
      const { refundAmountToBuyer } = App.meta.methods;
      $("#msg").html("Your transaction has been submitted. Please wait for few seconds for the confirmation").show();
      refundAmountToBuyer(productId).send({ from: App.account, gas: 4400000 }).then(function (f) {
        console.log(f);
        location.reload();
      }).catch(function (e) {
        console.log(e);
      })

      alert("refund the funds!");
    });

  },
};

function renderProductDetails(productId) {
  const { getProduct } = App.meta.methods;
  getProduct(productId).call().then(function (p) {
    let content = "";
    ipfs.cat(p[4]).then(function (file) {
      content = file.toString();
      $("#product-desc").append("<div>" + content + "</div>");
    });
    $("#product-image").append("<img src='http://127.0.0.1:8080/ipfs/" + p[3] + "' width='250px' />");
    $("#product-price").html(displayPrice(p[7]));
    $("#product-name").html(p[1]);
    $("#product-auction-end").html(displayEndHours(p[6]));
    $("#product-id").val(p[0]);
    $("#revealing, #bidding, #finalize-auction, #escrow-info").hide();
    let currentTime = getCurrentTimeInSeconds();


    const { highestBidderInfo } = App.meta.methods;
    $("#escrow-info").show();
    highestBidderInfo(productId).call().then(function (f) {
      if (f[2].toLocaleString() == '0') {
        $("#product-status").html("Auction has ended. No bids were revealed");
      } else {
        $("#product-status").html("Auction has ended. Product sold to " + f[0] + " for " + displayPrice(f[2]) +
          "The money is in the escrow. Two of the three participants (Buyer, Seller and Arbiter) have to " +
          "either release the funds to seller or refund the money to the buyer");
      }
    })
    const { escrowInfo } = App.meta.methods;
    escrowInfo(productId).call().then(function (f) {
      $("#buyer").html('Buyer: ' + f[0]);
      $("#seller").html('Seller: ' + f[1]);
      $("#arbiter").html('Arbiter: ' + f[2]);
      if (f[3] == true) {
        $("#release-funds-button").hide();
        $("#release-count").html("Amount from the escrow has been released");
      } else {
        $("#release-count").html(f[4] + " of 3 participants have agreed to release funds");
        $("#refund-count").html(f[5] + " of 3 participants have agreed to refund the buyer");
      }
    })

    // if (parseInt(p[8]) == 1) {
    //   const { highestBidderInfo } = App.meta.methods;
    //   $("#escrow-info").show();
    //   highestBidderInfo(productId).call().then(function (f) {
    //     if (f[2].toLocaleString() == '0') {
    //       $("#product-status").html("Auction has ended. No bids were revealed");
    //     } else {
    //       $("#product-status").html("Auction has ended. Product sold to " + f[0] + " for " + displayPrice(f[2]) +
    //         "The money is in the escrow. Two of the three participants (Buyer, Seller and Arbiter) have to " +
    //         "either release the funds to seller or refund the money to the buyer");
    //     }
    //   })
    //   const { escrowInfo } = App.meta.methods;

    //   escrowInfo(productId).call().then(function (f) {
    //     $("#buyer").html('Buyer: ' + f[0]);
    //     $("#seller").html('Seller: ' + f[1]);
    //     $("#arbiter").html('Arbiter: ' + f[2]);
    //     if (f[3] == true) {
    //       $("#release-count").html("Amount from the escrow has been released");
    //     } else {
    //       $("#release-count").html(f[4] + " of 3 participants have agreed to release funds");
    //       $("#refund-count").html(f[5] + " of 3 participants have agreed to refund the buyer");
    //     }
    //   })

    // } else if (parseInt(p[8]) == 2) {
    //   $("#product-status").html("Product was not sold");
    // } else if (currentTime < parseInt(p[6])) {
    //   $("#bidding").show();
    // } else if (currentTime < (parseInt(p[6]) + 600)) {
    //   $("#revealing").show();
    // } else {
    //   $("#finalize-auction").show();
    // }

    //$("#bidding").show();
    // $("#revealing").show();
    //$("#finalize-auction").show();




  })

}


function getCurrentTimeInSeconds() {
  return Math.round(new Date() / 1000);
}

function displayPrice(amt) {
  return 'Ξ' + App.web3.utils.fromWei(amt + "", 'ether');
}


function displayEndHours(seconds) {
  let current_time = getCurrentTimeInSeconds()
  let remaining_seconds = seconds - current_time;

  if (remaining_seconds <= 0) {
    return "Auction has ended";
  }

  let days = Math.trunc(remaining_seconds / (24 * 60 * 60));
  remaining_seconds -= days * 24 * 60 * 60;

  let hours = Math.trunc(remaining_seconds / (60 * 60));
  remaining_seconds -= hours * 60 * 60;

  let minutes = Math.trunc(remaining_seconds / 60);
  remaining_seconds -= minutes * 60;

  if (days > 0) {
    return "Auction ends in " + days + " days, " + hours + ", hours, " + minutes + " minutes";
  } else if (hours > 0) {
    return "Auction ends in " + hours + " hours, " + minutes + " minutes ";
  } else if (minutes > 0) {
    return "Auction ends in " + minutes + " minutes ";
  } else {
    return "Auction ends in " + remaining_seconds + " seconds";
  }
}

function renderStore() {
  const { getProduct } = App.meta.methods;
  const { productIndex } = App.meta.methods;
  productIndex().call().then(function (sum) {
    for (let i = 0; i <= sum; i++) {
      const p = getProduct(i).call().then(function (p) {
        $("#product-list").append(buildProduct(p));
      });
    }
  });
}

function buildProduct(product) {
  let node = $("<div/>");
  node.addClass("col-sm-3 text-center col-margin-bottom-1");
  node.append("<a href='product.html?id=" + product[0] + "'><img src='http://127.0.0.1:8080/ipfs/" + product[3] + "' width='150px' />");
  node.append("<div>" + product[1] + "</div>");
  node.append("<div>" + product[2] + "</div>");
  node.append("<div>" + product[5] + "</div>");
  node.append("<div>" + product[6] + "</div>");
  node.append("<div>Wei:" + product[7] + "</div>");
  return node;
}

function saveImageOnIpfs(reader) {
  return new Promise(function (resolve, reject) {
    const buffer = Buffer.from(reader.result);
    ipfs.add(buffer)
      .then((response) => {
        //console.log(response)
        resolve(response[0].hash);
      }).catch((err) => {
        console.error(err)
        reject(err);
      })
  })
}

function saveTextBlobOnIpfs(blob) {
  return new Promise(function (resolve, reject) {
    const descBuffer = Buffer.from(blob, 'utf-8');
    ipfs.add(descBuffer)
      .then((response) => {
        //console.log(response)
        resolve(response[0].hash);
      }).catch((err) => {
        console.error(err)
        reject(err);
      })
  })
}

function saveProduct(reader, decodedParams) {
  let imageId, descId;
  saveImageOnIpfs(reader).then(function (id) {
    imageId = id;
    saveTextBlobOnIpfs(decodedParams["product-description"]).then(function (id) {
      descId = id;
      saveProductToBlockchain(decodedParams, imageId, descId);
    })
  })
}

function saveProductToBlockchain(params, imageId, descId) {

  let auctionStartTime = Date.parse(params["product-auction-start"]) / 1000;
  let auctionEndTime = auctionStartTime + parseInt(params["product-auction-end"]) * 24 * 60 * 60

  const { addProductToStore } = App.meta.methods;
  console.log(params);
  console.log(App.account);
  addProductToStore(params["product-name"], params["product-category"], imageId, descId, auctionStartTime,
    auctionEndTime, App.web3.utils.toWei(params["product-price"] + "", 'ether'), parseInt(params["product-condition"])).send({ from: App.account, gas: 440000 }).then(function (f) {
      console.log(f);
      $("#msg").show();
      $("#msg").html("Your product was successfully added to your store!");
    })
}

window.App = App;

window.addEventListener("load", function () {
  if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);
    window.ethereum.enable(); // get permission to access accounts
  } else {
    console.warn(
      "No web3 detected. Falling back to http://127.0.0.1:8545. You should remove this fallback when you deploy live",
    );
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(
      new Web3.providers.HttpProvider("http://192.168.96.130:8545"),
    );
  }

  App.start();
});
