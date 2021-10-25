import Head from "next/head";
import { AppProps } from "next/app";
import "../styles/index.css";
import Web3 from "web3";
import { useEffect, useState } from "react";
import { EthereumContext } from "../context/EthereumContext";

function MyApp({ Component, pageProps }: AppProps) {
  const [provider, setProvider] = useState<any>(null);
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [currentAcc, setCurrentAcc] = useState<string>("");

  // Initial settings
  useEffect(() => {
    if ((window as any).ethereum) {
      handleEthereum();
    } else {
      window.addEventListener("ethereum#initialized", handleEthereum, {
        once: true,
      });

      // If the event is not dispatched by the end of the timeout
      // the user probably doesn't have MetaMask installed
      setTimeout(handleEthereum, 3000);
    }
  }, []);

  useEffect(() => {
    if (web3) {
      setCurrentlyConnectedAccount();
    }
  }, [web3]);

  const handleEthereum = () => {
    const { ethereum } = window as any;

    if (ethereum && ethereum.isMetaMask) {
      setProvider(ethereum);
      console.log(ethereum);

      ethereum.on("accountsChanged", (accs: string[]) => {
        setAccounts(accs);
        setCurrentAcc(accs[0]);
      });

      setWeb3(new Web3(ethereum));
      console.log(web3);
    } else {
      window.alert("Please install Metamask");
    }
  };

  const setCurrentlyConnectedAccount = async () => {
    let accounts = await web3.eth.getAccounts();
    if (accounts && accounts.length > 0) {
      console.log(accounts[0]);
      setCurrentAcc(accounts[0]);
    }
  };

  return (
    <EthereumContext.Provider
      value={{
        provider,
        accounts,
        web3,
        currentAcc,
      }}
    >
      <Head>
        <title>NFT Marketplace Tutorial</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Component {...pageProps} />
    </EthereumContext.Provider>
  );
}

export default MyApp;
