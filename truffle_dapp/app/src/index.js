import { prettyPrintLegacyAssemblyJSON } from "solc/translate";
import Web3 from "web3";
import metaCoinArtifact from "../../build/contracts/TokenVoting.json";

let candidates = {
};

let tokenPriceStr = null;

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

function utf8ToHex(s) {
  return encodeURIComponent(s).replace(/%/g, ""); // remove all '%' characters
}


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

      const { allCandidates } = this.meta.methods;
      const candidateArray = await allCandidates().call();
      for (let i = 0; i < candidateArray.length; i++) {
        /* We store the candidate names as bytes32 on the blockchain. We use the
        * handy toUtf8 method to convert from bytes32 to string
        */
        candidates[web3.utils.hexToUtf8(candidateArray[i])] = "candidate-" + i;
      }
      setupCandidateRows();

      let candidateNames = Object.keys(candidates);
      for (var i = 0; i < candidateNames.length; i++) {
        let name = candidateNames[i];
        const { totalVotesFor } = this.meta.methods;
        $("#" + candidates[name]).html(await totalVotesFor(stringToHex(name)).call());
      }

      const { totalTokens } = this.meta.methods;
      $("#tokens-total").html((await totalTokens().call()).toString());
      const { balanceTokens } = this.meta.methods;
      $("#tokens-sale").html((await balanceTokens().call()).toString());
      const { tokenSold } = this.meta.methods;
      $("#tokens-sold").html((await tokenSold().call()).toString());
      const { tokenPrice } = this.meta.methods;
      tokenPriceStr = web3.utils.fromWei((await tokenPrice().call()).toString());
      $("#token-cost").html(tokenPriceStr + " Ether");
      web3.eth.getBalance(this.meta._address, function (error, result) {
        $("#contract-balance").html(web3.utils.fromWei(result.toString()) + " Ether");
      });

      const { voterDetails } = this.meta.methods;
      let v = await voterDetails(this.account).call()
      $("#tokens-bought").html("Total Tokens bought: " + v[0]);
      let votesPerCandidate = v[1];
      $("#votes-cast").empty();
      $("#votes-cast").append("Votes cast per candidate: <br>");
      let allCandidateList = Object.keys(candidates);
      for (let i = 0; i < allCandidateList.length; i++) {
        $("#votes-cast").append(allCandidateList[i] + ": " + votesPerCandidate[i] + "<br>");
      }
    } catch (error) {
      console.error(error);
    }
  },

  lookupVoterInfo: async function () {
    let address = $("#voter-info").val();
    const { voterDetails } = this.meta.methods;
    let v = await voterDetails(address).call();
    $("#tokens-bought").html("Total Tokens bought: " + v[0].toString());
    let votesPerCandidate = v[1];
    $("#votes-cast").empty();
    $("#votes-cast").append("Votes cast per candidate: <br>");
    let allCandidates = Object.keys(candidates);
    for (let i = 0; i < allCandidates.length; i++) {
      $("#votes-cast").append(allCandidates[i] + ": " + votesPerCandidate[i] + "<br>");
    }
  },

  voteForCandidate: async function () {
    let candidateName = $("#candidate").val();
    let voteTokens = $("#vote-tokens").val();
    $("#msg").html("Vote has been submitted. The vote count will increment as soon as the vote is recorded on the blockchain. Please wait.")
    $("#vote-tokens").val("");
    const { voteForCandidate } = this.meta.methods;
    await voteForCandidate(stringToHex(candidateName), voteTokens).send({ from: this.account });
    const { totalVotesFor } = this.meta.methods;
    $("#" + candidates[candidateName]).html(await totalVotesFor(stringToHex(candidateName)).call());
  },

  buyTokens: async function () {
    console.log(tokenPriceStr);
    let tokensToBuy = $("#buy").val();
    let price = tokensToBuy * tokenPriceStr * 1000000000000000000;
    $("#buy-msg").html("Purchase order has been submitted. Please wait.");
    const { buy } = this.meta.methods;
    buy().send({ value: price, from: this.account }).then(function (v) {
      $("#buy-msg").html("");
      // web3.eth.getBalance(this.meta._address, function (error, result) {
      //   $("#contract-balance").html(web3.utils.fromWei(result.toString()) + " Ether");
      // });
    });
  },
};



function setupCandidateRows() {
  Object.keys(candidates).forEach(function (candidate) {
    $("#candidate-rows").append("<tr><td>" + candidate + "</td><td id='" + candidates[candidate] + "'></td></tr>");
  });
}





window.App = App;

window.addEventListener("load", function () {
  if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);
    window.ethereum.enable(); // get permission to access accounts
  } else {
    console.warn(
      "No web3 detected. Falling back to http://192.168.96.130:8545. You should remove this fallback when you deploy live",
    );
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(
      new Web3.providers.HttpProvider("http://192.168.96.130:8545"),
    );
  }
  App.start();
});
