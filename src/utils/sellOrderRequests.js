import { currentChainInfo } from "../constants/addresses";
import axios from "axios";

const apiDomain = currentChainInfo.apiDomain;

const random = (min, max) => Math.floor(Math.random() * (max - min)) + min;

const DOMAIN_TYPE = [
  {
    type: "string",
    name: "name",
  },
  {
    type: "string",
    name: "version",
  },
  {
    type: "uint256",
    name: "chainId",
  },
  {
    type: "address",
    name: "verifyingContract",
  },
];

export const createSellOrder = async (type, provider, params) => {
  let order;
  let signature;
  const salt = random(1, 1000);

  switch (type) {
    case "MAKE_ERC721_TAKE_ETH":
      order = createERC721ForEthOrder(
        params.accountAddress,
        params.makeERC721Address,
        params.makeERC721TokenId,
        params.ethAmt,
        salt
      );
      console.log("SELL ORDER");
      console.log({ order });
      /* eslint-disable */
      const preparedOrder = await prepareOrderMessage(order);
      console.log("SELL ORDER1");

      /* eslint-enable */
      console.log({ preparedOrder });
      signature = await sign(provider, preparedOrder, params.accountAddress);
      console.log("SELL ORDER2");

      break;

    default:
      break;
  }

  const raribleOrderUrl = `${apiDomain}/protocol/v0.1/ethereum/order/orders`;

  const raribleJson = { ...order, signature: signature.result };
  console.log(raribleJson);

  const raribleOrderResult = await axios.post(
    raribleOrderUrl,
    JSON.stringify(raribleJson),
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return raribleOrderResult;
};

function createERC721ForEthOrder(maker, contract, tokenId, price, salt) {
  return {
    type: "RARIBLE_V2",
    maker,
    make: {
      assetType: {
        assetClass: "ERC721",
        contract,
        tokenId,
      },
      value: "1",
    },
    take: {
      assetType: {
        assetClass: "ETH",
      },
      value: price,
    },
    data: {
      dataType: "RARIBLE_V2_DATA_V1",
      payouts: [],
      originFees: [],
    },
    salt,
    signature: "0",
  };
}

async function prepareOrderMessage(form) {
  console.log("SELL ORDER inside");
  console.log(form);

  const raribleEncodeOrderUrl = `${apiDomain}/protocol/v0.1/ethereum/order/encoder/order`;
  const res = await axios.post(raribleEncodeOrderUrl, JSON.stringify(form), {
    headers: { "Content-Type": "application/json" },
  });
  console.log(res.data.signMessage);

  return res.data.signMessage;
}

async function signTypedData(provider, from, data) {
  const msgData = JSON.stringify(data);
  const sig = await provider.send("eth_signTypedData_v4", [from, msgData]);
  const sig0 = sig.toString().substring(2);
  const r = `0x${sig0.toString().substring(0, 64)}`;
  const s = `0x${sig0.toString().substring(64, 128)}`;
  const v = parseInt(sig0.toString().substring(128, 130), 16);
  return {
    data,
    sig,
    v,
    r,
    s,
  };
}

function createTypeData(domainData, primaryType, message, types) {
  return {
    types: {
      EIP712Domain: DOMAIN_TYPE,
      ...types,
    },
    domain: domainData,
    primaryType,
    message,
  };
}

export async function sign(provider, order, account) {
  const data = createTypeData(
    order.domain,
    order.structType,
    order.struct,
    order.types
  );
  console.log({ data });
  return (await signTypedData(provider, account, data)).sig;
}
