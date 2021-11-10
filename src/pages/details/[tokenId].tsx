import { useEthContext } from "../../context/EthereumContext";
import { useState, useEffect } from "react";
import Loader from "react-loader-spinner";
import axios from "axios";
import { currentChainInfo } from "../../constants/addresses";
import { useRouter } from "next/router";
import { createSellOrder } from "../../utils/sellOrderRequests";
import { SelectChainDropdown } from "../../components/SelectChainDropdown";

export default function Details() {
  const { accounts, provider, currentAcc } = useEthContext();
  const [nftDetails, setNftDetails] = useState<any>();
  const [sellOrder, setSellOrder] = useState<any>();
  const [nftPrice, setnftPrice] = useState<string>("");
  const [isLoading, setIsLoading] = useState<Boolean>(true);

  let router = useRouter();

  let { tokenId } = router.query;

  useEffect(() => {
    if (tokenId) {
      fetchTokenData();
      fetchTokenSellOrder();
    }
  }, [tokenId]);

  const fetchTokenData = async () => {
    let { data } = await axios.get(
      currentChainInfo.apiDomain +
        `/protocol/v0.1/ethereum/nft/items/${tokenId}`,
      { params: { itemId: tokenId } }
    );
    setNftDetails(data);
    setIsLoading(false);
    console.log(data);
  };

  const fetchTokenSellOrder = async () => {
    const token = (tokenId as string).split(":").pop();
    const contract = (tokenId as string).split(":")[0];

    let { data } = await axios.get(
      currentChainInfo.apiDomain +
        "/protocol/v0.1/ethereum/order/orders/sell/byItem",
      { params: { contract, tokenId: token } }
    );

    //@ts-ignore
    let sortedData = data.orders.sort(
      //@ts-ignore
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    //@ts-ignore
    setSellOrder(sortedData[0]);
    console.log(data);
  };

  const handleInputChange = (event) => {
    setnftPrice(event.target.value);
  };

  const handleCreateSellOrder = async (e) => {
    e.preventDefault();

    // Remember to parseFloat instead of int
    // because int round it down or up

    const sellOrderRes = await createSellOrder(
      `MAKE_ERC721_TAKE_ETH`,
      provider,
      {
        accountAddress: currentAcc,
        makeERC721Address: currentChainInfo.address,
        makeERC721TokenId: (tokenId as string).split(":").pop(),
        ethAmt: (parseFloat(nftPrice) * 10 ** 18).toString(),
      }
    );

    console.log(sellOrderRes);

    fetchTokenSellOrder();
  };

  return (
    <div className="flex items-center p-4 min-h-screen w-full justify-center bg-yellow-400 relative">
      <SelectChainDropdown />
      {isLoading && (
        <div className="w-full h-full flex items-center justify-start flex-col">
          <Loader type="TailSpin" color="#000" height={50} width={50} />
          <p className="mt-10">Loading your NFTs...</p>
        </div>
      )}

      {!isLoading && (
        <main className="w-full h-full flex flex-row items-center">
          <div className="flex justify-center items-center flex-1 h-full bg-gray-100 max-h-90">
            <img
              src={nftDetails.meta.image?.url.ORIGINAL}
              className=" flex-shrink-0 min-w-full min-h-full object-cover"
            />
          </div>
          <div className="flex flex-col flex-1 items-center justify-between">
            <div className="flex flex-col items-start w-64 mb-20">
              <p className="font-bold uppercase mb-4">Details</p>
              <p>
                <b>NAME:</b> {nftDetails.meta.name}
              </p>
              <p>
                <b>DESCRIPTION:</b> {nftDetails.meta.description}
              </p>
            </div>
            <form className=" flex flex-col" onSubmit={handleCreateSellOrder}>
              {sellOrder ? (
                <p className="text-green-500 font-bold mb-6 text-center">{`Listed currently for ${
                  parseInt(sellOrder.take.value) / 10 ** 18
                } ETH ✅`}</p>
              ) : (
                <p className="text-red-500 font-bold mb-4 text-center">
                  Currently not listed ❌
                </p>
              )}
              <input
                type="text"
                value={nftPrice}
                onChange={handleInputChange}
                className=" border-2 rounded-2xl shadow-md py-2 px-4 mb-4 w-64"
                placeholder="NFT Price"
              />
              <button
                type="submit"
                className="bg-purple-700 hover:bg-purple-900 text-white rounded-2xl py-2 px-4 w-64"
              >
                Create sell order
              </button>
            </form>
          </div>
        </main>
      )}
    </div>
  );
}
