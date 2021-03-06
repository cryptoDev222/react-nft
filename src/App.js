import React, { Component } from "react";
import { ThemeProvider } from "@material-ui/styles";
import { ToastContainer, toast } from "react-toastify";
import theme from "./theme";
import Dashboard from "./Dashboard";
import MyContext from "./lib/context";
import Web3 from "web3";
import axios from "axios";
import {
  API_URL_AFTER,
  API_URL_BEFORE,
  APETOKEN_ADDRESS,
  STAKINGPOOLV1_ADDRESS,
  STAKINGPOOLV2_ADDRESS as STAKINGPOOL_ADDRESS,
  API_ADDRESS,
  CHAIN_ID,
} from "./lib/constant";
import Apetoken from "./abis/ApeToken.json";
import StakingpoolV1 from "./abis/StakingPoolNew.json";
import Stakingpool from "./abis/StakingPoolV2.json";
import "react-toastify/dist/ReactToastify.css";

toast.configure();
export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      account: "",
      balance: "",
      apeToken: null,
      stakingPool: null,
      stakingPoolV1: null,
      femaleId: [],
      maleId: [],
      babyId: [],
      staked: [],
      femaleStakes: 0,
      maleStakes: 0,
      babyStakes: 0,
      curRewards: 0,
      isStaking: false,
      isWithdraw: false,
    };
    this.connectWallet = this.connectWallet.bind(this);
    this.stake = this.stake.bind(this);
    this.claimBaby = this.claimBaby.bind(this);
    this.getReward = this.getReward.bind(this);
    this.withdraw = this.withdraw.bind(this);
    this.migrateV1 = this.migrateV1.bind(this);
  }

  componentDidMount() {
    if (window.ethereum) {
      this.connectWallet();
    }
    window.onbeforeunload = () => false;
  }

  componentDidUpdate() {
    if (window.ethereum.chainId !== CHAIN_ID) {
      toast.error("Please select correct network!");
    }
  }

  async connectWallet() {
    // enable ethereum
    await window.ethereum.enable();
    if (CHAIN_ID !== window.ethereum.chainId) {
      toast.error("Please select ethereum mainnet!");
      return;
    }
    let res = await this.loadWeb3();
    if (res) await this.loadBlockchainData();
  }

  async loadWeb3() {
    const self = this;

    if (window.ethereum) {
      // register handlers
      window.ethereum.on("chainChanged", function (chain) {
        if (chain !== CHAIN_ID) {
          self.setState({
            account: "",
            balance: "",
            apeToken: null,
            stakingPool: null,
            femaleId: [],
            maleId: [],
            babyId: [],
            staked: [],
            femaleStakes: 0,
            maleStakes: 0,
            babyStakes: 0,
            curRewards: 0,
          });
          return false;
        }
      });

      window.ethereum.on("accountsChanged", function (accounts) {
        if (accounts === undefined || accounts[0] === undefined) {
          self.setState({
            account: "",
            balance: "",
            apeToken: null,
            stakingPool: null,
            stakingPoolV1: null,
            femaleId: [],
            maleId: [],
            babyId: [],
            staked: [],
            femaleStakes: 0,
            maleStakes: 0,
            babyStakes: 0,
            curRewards: 0,
            dueDate: 0,
          });
          return false;
        }

        if (window.ethereum.chainId !== CHAIN_ID) {
          return false;
        } else {
          window.web3.eth.getBalance(accounts[0]).then((data) => {
            self.loadBlockchainData();
          });
        }
      });

      window.ethereum.on("disconnect", function () {});

      // /////////////////

      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();

      if (window.ethereum.chainId !== CHAIN_ID) {
        return false;
      }

      return true;
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
      return true;
    } else {
      window.alert(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
      return false;
    }
  }

  async loadBlockchainData() {
    if (CHAIN_ID !== window.ethereum.chainId) {
      toast.error("Please select ethereum mainnet!");
      return;
    }
    const web3 = window.web3;
    // Load account
    const accounts = await web3.eth.getAccounts();

    // Load contracts
    try {
      const apeToken = new web3.eth.Contract(Apetoken, APETOKEN_ADDRESS);
      this.setState({ apeToken });
    } catch (err) {
      console.log(err);
      this.setState({ apeToken: null });
    }

    try {
      const stakingPool = new web3.eth.Contract(
        Stakingpool,
        STAKINGPOOL_ADDRESS
      );

      this.setState({ stakingPool });
    } catch (err) {
      console.log(err);
      this.setState({ stakingPool: null });
    }

    try {
      const stakingPoolV1 = new web3.eth.Contract(
        StakingpoolV1,
        STAKINGPOOLV1_ADDRESS
      );

      this.setState({ stakingPoolV1 });
    } catch (err) {
      console.log(err);
      this.setState({ stakingPoolV1: null });
    }

    // Load balances
    let balance =
      Math.floor((await web3.eth.getBalance(accounts[0])) / 10000000000 + 0.5) /
      100000000;
    this.setState({ account: accounts[0], balance: balance });

    // get Staked List ////
    if (this.state.stakingPool !== null) {
      const self = this;
      this.state.stakingPool.methods
        .getStaked(this.state.account)
        .call()
        .then((data) => {
          axios
            .get(
              API_ADDRESS +
                "stakedTokens?ids=" +
                JSON.stringify(data) +
                "&chainId=" +
                window.ethereum.chainId +
                "&account=" +
                accounts[0]
            )
            .then(async (response) => {
              self.setState({ staked: response.data });
              let tokenData = response.data;
              let females = [];
              for (let i = 0; i < tokenData.length; i++) {
                if (
                  tokenData[i].gender === 1 &&
                  data.includes(tokenData[i]["token_id"])
                ) {
                  females.push(tokenData[i]);
                }
              }
              if (females.length !== 0) {
                let dateValue = await self.state.stakingPool.methods
                  .breedingEnd(females[0]["token_id"])
                  .call();

                for (let i = 1; i < females.length; i++) {
                  let curValue = await self.state.stakingPool.methods
                    .breedingEnd(females[i]["token_id"])
                    .call();

                  if (curValue < dateValue) {
                    dateValue = curValue;
                  }
                }

                const endDate = new Date(dateValue * 1000);
                self.setState({ dueDate: endDate - new Date() });
              }
            });
        });
    }

    // get total Staked List//
    const self = this;
    const params = { account: accounts[0], chainId: window.ethereum.chainId };
    axios.get(API_ADDRESS + "allStaked", { params }).then((response) => {
      let data = response.data;
      let fs = 0,
        ms = 0,
        bs = 0;
      data.forEach((data) => {
        switch (data.gender) {
          case 1:
            fs = data.count;
            break;
          case 2:
            ms = data.count;
            break;
          default:
            bs = data.count;
        }
      });
      self.setState({
        femaleStakes: fs,
        maleStakes: ms,
        babyStakes: bs,
      });
    });
    // ///////////////////////

    // get current Rewards State//
    setInterval(() => {
      if (this.state.stakingPool !== null) {
        self.state.stakingPool.methods
          .earned(self.state.account)
          .call({ from: self.state.account })
          .then((data) => {
            self.setState({
              curRewards: Math.floor(data * 100 + 0.5) / 105.264,
            });
          });
      }
    }, 6000);
    // ///////////////////////////

    this.loadCollections(accounts[0]);
  }

  loadCollections(account) {
    if (account === undefined) return;

    if (window.ethereum.chainId !== CHAIN_ID) {
      return;
    }

    let maleId = [];
    let femaleId = [];
    let babyId = [];
    const self = this;
    const url = API_URL_BEFORE + account + API_URL_AFTER;

    axios
      .get(url)
      .then(function (response) {
        // handle success
        let data = response.data.assets;
        let token_ids = [];
        let images = [];
        data.forEach((value) => {
          token_ids.push(value.token_id);
          images.push(value.image_url);
        });
        // enable api when loading tokens from network
        axios
          .put(API_ADDRESS + "accounts", {
            account,
            female: femaleId.length,
            male: maleId.length,
            baby: babyId.length,
            chainId: window.ethereum.chainId,
          })
          .then((response) => {});

        axios
          .put(API_ADDRESS + "tokens", {
            ids: token_ids,
            images: images,
            account,
            chainId: window.ethereum.chainId,
          }) //sync tokes list
          .then((response) => {
            let ids = response.data.ids;
            const forEach = (_) => {
              let addData = [];
              data.forEach((oneData) => {
                if (ids.includes(oneData["token_id"])) {
                  if (
                    oneData.hasOwnProperty("traits") &&
                    oneData["traits"].length !== 0
                  ) {
                    let traits = oneData.traits;
                    if (traits.length > 0) {
                      for (let i = 0; i < traits.length; i++) {
                        if (traits[i]["trait_type"] === "Gender") {
                          switch (traits[i].value) {
                            case "Male":
                              oneData["gender"] = 2;
                              break;
                            case "Female":
                              oneData["gender"] = 1;
                              break;
                            default:
                              oneData["gender"] = 3;
                          }
                        }
                      }
                    }
                  } else {
                    oneData["gender"] = (oneData["id"] % 3) + 1; // for RINKEBY
                  }

                  if (
                    oneData.hasOwnProperty("gender") &&
                    oneData["gender"] != null
                  ) {
                    addData.push({
                      name: oneData["name"],
                      token_id: oneData["token_id"],
                      gender: oneData["gender"],
                      img_url: oneData["image_url"],
                      traits: oneData["traits"].length,
                      chainId: window.ethereum.chainId,
                    });
                  }
                }
              });

              axios
                .post(API_ADDRESS + "createtokens", { addData, account })
                .then((status) => {
                  const params = {
                    owner: account,
                    chainId: window.ethereum.chainId,
                  };

                  axios
                    .get(API_ADDRESS + "initiatedTokens", { params })
                    .then(({ data }) => {
                      let returndata = data.assets;
                      console.log(data);
                      returndata.forEach((ape) => {
                        switch (ape["gender"]) {
                          case 1:
                            femaleId.push(ape);
                            break;
                          case 2:
                            maleId.push(ape);
                            break;
                          default:
                            babyId.push(ape);
                        }
                      });

                      self.setState({ maleId, femaleId, babyId });
                    });
                });
            };

            forEach();
          });
        // //////////////////////////////////////////////
      })
      .catch(function (error) {
        // handle error
      })
      .then(function () {
        // always executed
      });
  }

  stake(f, m, b, reset) {
    if (this.state.stakingPool === null || this.state.apeToken === null) {
      toast.error("Failed loading Contract!");
      return;
    }

    // set is Staking ////
    this.setState({ isStaking: true });

    // set approval ////
    this.state.apeToken.methods
      .isApprovedForAll(this.state.account, this.state.stakingPool._address)
      .call()
      .then((data) => {
        if (!data) {
          this.state.apeToken.methods
            .setApprovalForAll(this.state.stakingPool._address, true)
            .send({ from: this.state.account })
            .on("reject", () => {
              this.setState({ isStaking: false });
            })
            .then((data) => {
              this.stakeAction(f, m, b, reset);
            });
        } else {
          this.stakeAction(f, m, b, reset);
        }
      })
      .catch((err) => {
        // disable isStaking ////
        this.setState({ isStaking: false });
      });

    // this.state.apeToken.methods
    //   .isApprovedForAll(this.state.account, this.state.apeToken._address)
    //   .call()
    //   .then((data) => {
    //     if (!data) {
    //       this.state.apeToken.methods
    //         .setApprovalForAll(this.state.apeToken._address, true)
    //         .send({ from: this.state.account })
    //         .then("receipt", (receipt) => {});
    //     }
    //   });
    ////////////////
  }

  withdraw() {
    this.setState({ isWithdraw: true });
    if (this.state.stakingPool === null || this.state.apeToken === null) {
      toast.error("Failed loading Contract!");
      return;
    }

    this.state.stakingPoolV1.methods
      .getStaked(this.state.account)
      .call()
      .then((data) => {
        if (data.length === 0) {
          this.state.stakingPool.methods
            .withdrawAll()
            .send({ from: this.state.account })
            .then((data) => this.setState({ isWithdraw: false }))
            .catch((err) => this.setState({ isWithdraw: false }));
        } else {
          this.state.stakingPoolV1.methods
            .withdrawAll()
            .send({ from: this.state.account })
            .then((data) => {
              this.state.stakingPool.methods
                .withdrawAll()
                .send({ from: this.state.account })
                .then((data) => this.setState({ isWithdraw: false }))
                .catch((err) => this.setState({ isWithdraw: false }));
            })
            .catch((err) => this.setState({ isWithdraw: false }));
        }
      });
  }

  stakeAction(f, m, b, reset) {
    let stakeArray = [];
    let stakeCount = { f: 0, m: 0, b: 0 };
    if (f.length !== 0) {
      f.forEach((data) => stakeArray.push(data.value));
      stakeCount.f = f.length;
    }
    if (m.length !== 0) {
      m.forEach((data) => stakeArray.push(data.value));
      stakeArray.m = m.length;
    }
    if (b.length !== 0) {
      b.forEach((data) => stakeArray.push(data.value));
      stakeArray.b = b.length;
    }

    if (stakeArray.length !== 0) {
      const self = this;
      this.state.stakingPool.methods
        .stakeBatch(stakeArray)
        .send({ from: this.state.account })
        .then((data) => {
          reset();
          this.setState({ isStaking: false });
          self.loadBlockchainData();
        })
        .catch((err) => {
          this.setState({ isStaking: false });
        });
    } else {
      this.setState({ isStaking: false });
    }
  }

  claimBaby() {
    if (this.state.stakingPool === null) {
      toast.error("Failed loading contract!");
      return;
    }
    let femaleData = [];
    let i = 0;
    for (i = 0; i < this.state.staked.length; i++) {
      if (this.state.staked[i].gender === 1) {
        femaleData.push(this.state.staked[i]);
      }
    }

    if (femaleData.length === 0) {
      toast.error("No female staked!");
      return;
    }

    let maxFlag = true;

    for (let i = 0; i < femaleData.length; i++) {
      let maxBabyCount =
        femaleData[i]["class"] === 3 ? 6 : femaleData[i]["class"] === 2 ? 4 : 2;

      if (femaleData[i]["baby_count"] < maxBabyCount) {
        maxFlag = false;
        break;
      }
    }

    if (maxFlag) {
      toast.error("Staked females alreday have max babies!");
      return;
    }

    const self = this;

    this.state.stakingPool.methods
      .claimBaby()
      .send({ from: this.state.account })
      .then((data) => {
        self.loadBlockchainData();
      });
  }

  getReward() {
    if (this.state.stakingPool === null) {
      toast.error("Failed loading contract!");
      return;
    }

    const self = this;

    this.state.stakingPool.methods
      .earned(this.state.account)
      .call({ from: this.state.account })
      .then((rewards) => {
        this.state.stakingPool.methods
          .getReward()
          .send({ from: this.state.account })
          .then((data) => {
            self.loadBlockchainData();
          });
      });
  }

  migrateV1() {
    this.state.stakingPoolV1.methods
      .getStaked(this.state.account)
      .call({ from: this.state.account })
      .then((data) => {
        this.state.apeToken.methods
          .isApprovedForAll(this.state.account, this.state.stakingPool._address)
          .call()
          .then((result) => {
            if (result) {
              this.state.stakingPoolV1.methods
                .withdrawAll()
                .send({ from: this.state.account })
                .then((res) => {
                  this.state.stakingPool.methods
                    .migrateV1(data)
                    .send({ from: this.state.account })
                    .then(console.log)
                    .catch(console.log);
                });
            } else {
              this.state.apeToken.methods
                .setApprovalForAll(this.state.stakingPool._address, true)
                .send({ from: this.state.account })
                .then((result) => {
                  this.state.stakingPoolV1.methods
                    .withdrawAll()
                    .send({ from: this.state.account })
                    .then((res) => {
                      this.state.stakingPool.methods
                        .migrateV1(data)
                        .send({ from: this.state.account })
                        .then(console.log)
                        .catch(console.log);
                    });
                });
            }
          });
        console.log(data);
      });
  }

  render() {
    return (
      <ThemeProvider theme={theme}>
        <MyContext.Provider value={this}>
          <ToastContainer />
          <Dashboard
            account={this.state.account}
            balance={this.state.balance}
          />
        </MyContext.Provider>
      </ThemeProvider>
    );
  }
}
