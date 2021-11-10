import MetaMaskButton from "../components/ConnectMetamaskButton";
import { useEthContext } from "../context/EthereumContext";
import { useState, useEffect } from "react";
import Loader from "react-loader-spinner";
import axios from "axios";
import { currentChainInfo } from "../constants/addresses";
import NFTTile from "../components/NFTTile";
import { SelectChainDropdown } from "../components/SelectChainDropdown";

type NftItem = {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
};

export default function Home() {
  const { accounts, provider, currentAcc } = useEthContext();
  const [nfts, setNfts] = useState<Array<NftItem>>();
  const [isLoading, setIsLoading] = useState<Boolean>(true);

  useEffect(() => {
    // If there's no account connected -> do nothing
    if (!currentAcc) {
      return;
    }

    fetchNftByOwner();
  }, [currentAcc]);

  const fetchNftByOwner = async () => {
    // Get nft by owner https://api-reference.rarible.com/#operation/getNftItemsByOwner
    const { data }: any = await axios.get(
      currentChainInfo.apiDomain + "/protocol/v0.1/ethereum/nft/items/byOwner",
      {
        params: {
          owner: currentAcc,
        },
      }
    );

    setIsLoading(false);

    //Filtering fetched items by properties we need
    // There's no sense in having them all
    let fetchedItems: Array<NftItem> = data.items.map((item) => {
      return {
        id: item.id,
        name: item.meta.name,
        imageUrl: item.meta.image?.url.ORIGINAL,
        description: item.meta.description,
      };
    });

    setNfts(fetchedItems);
    console.log(fetchedItems);
  };

  const handleConnectWallet = async () => {
    await provider.request({ method: `eth_requestAccounts` });
  };

  const handleSelectNft = () => {};

  return (
    <div className="flex items-center p-4 min-h-screen w-full justify-center bg-yellow-400 relative">
      <SelectChainDropdown />
      <main>
        {/* If the user is not connected to site */}
        {!currentAcc && (
          <MetaMaskButton onClick={handleConnectWallet} accounts={accounts} />
        )}
        {/* If he is connected fetch his nfts, show loader while doing it */}
        {currentAcc && isLoading && (
          <div className="w-full h-full flex items-center justify-start flex-col">
            <Loader type="TailSpin" color="#000" height={50} width={50} />
            <p className="mt-10">Loading your NFTs...</p>
          </div>
        )}

        {/* If he is connected and NFTS are fetched show them */}
        {currentAcc && !isLoading && (
          <div className="w-full h-full flex items-center justify-start flex-wrap">
            {nfts && nfts.length > 0
              ? nfts.map((nft) => {
                  return (
                    <NFTTile
                      name={nft.name}
                      id={nft.id}
                      imgSrc={nft.imageUrl}
                      key={nft.id}
                    />
                  );
                })
              : "It seems that you don't have any NFTs yet :)"}
          </div>
        )}
      </main>
    </div>
  );
}
