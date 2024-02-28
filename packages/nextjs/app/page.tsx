"use client";

// import { Web3Provider } from "@ethersproject/providers";
import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { SmartAccount } from "@particle-network/aa";
import { ParticleNetwork } from "@particle-network/auth";
import { Button } from "@web3uikit/core";
import type { NextPage } from "next";
import { encodeFunctionData, isAddress, parseEther } from "viem";
import { useAccount, useWaitForTransaction } from "wagmi";
import { useSendTransaction } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address, AddressInput, Balance, EtherInput } from "~~/components/scaffold-eth";
import {
  useAccountBalance,
  useScaffoldContract,
  useScaffoldContractRead,
  useScaffoldEventHistory,
} from "~~/hooks/scaffold-eth";
import { useSmartAccount } from "~~/hooks/scaffold-eth/useSmartAccount";
import scaffoldConfig from "~~/scaffold.config";
import { notification } from "~~/utils/scaffold-eth";

const Home: NextPage = () => {
  const [particleInstance, setParticleInstance] = useState<ParticleNetwork | null | undefined>(null);
  // const [provider, setProvider] = useState<Web3Provider|undefined>(undefined)
  const [smartAccount, setSmartAccount] = useState<SmartAccount | undefined>(undefined);
  const [smartAccountAddress, setSmartAccountAddress] = useState<string | undefined>(undefined);
  const [smartAccountSendValue, setSmartAccountSendValue] = useState<string>("0");
  const [isLoadingFundingSA, setIsLoadingFundingSA] = useState<boolean>(false);
  // const [isMinting, setIsMinting] = useState<boolean>(false);
  // const [tokensUris, setTokensUris] = useState<any>();
  // const [selectedNft, setSelectedNft] = useState<string>("");
  const [receipientAddress, setReceipientAddress] = useState<string>("");
  // const [transferTokenId, setTransferTokenId] = useState<string>("");
  const [isLoadingSendNft, setIsLoadingSendNft] = useState<boolean>(false);
  const accountState = useAccount();
  const connectedAddress = accountState.address;
  const { balance: smartAccountBalance } = useAccountBalance(smartAccountAddress);
  const { data: result, sendTransactionAsync } = useSendTransaction();
  const { isLoading: isConfirming, error, status } = useWaitForTransaction({ hash: result?.hash, confirmations: 1 });
  const mutantsNftContract = useScaffoldContract({ contractName: "MutantsNft" });

  /* eslint-disable */
  useEffect(() => {
    if (connectedAddress) {
      const loadSmartAccountData = async () => {
        const smartAccountData = useSmartAccount(accountState);
        setParticleInstance((await smartAccountData).particleInstance)
        // setProvider((await smartAccountData).provider)
        setSmartAccount((await smartAccountData).smartAccount)
      }  
      loadSmartAccountData();    
    }
  }, [connectedAddress])

  useEffect(() => {
    const SMBalanceAndAddress = async () => {
      setSmartAccountAddress(await smartAccount?.getAddress())
    }
    SMBalanceAndAddress();
  }, [smartAccount])
  /* eslint-enable */

  // const executeUserOp = async (provider:Web3Provider, smartAccount:SmartAccount) => {
  //   const txs = [
  //     {
  //     to: '0x55fF7E28e7cd43C104dC89Aa69285E0E6EBa064e',
  //     value: '10000000000',
  //     },
  //   ]

  //   const feeQuotesResult = await smartAccount.getFeeQuotes(txs);

  //   const tokenPaymasterAddress = await smartAccount.getAddress();
  //   const feeQuote = feeQuotesResult.verifyingPaymasterNative.feeQuote;

  //   const userOpBundle = await smartAccount.buildUserOperation({
  //     tx:txs,
  //     // feeQuote:feeQuote,
  //     // tokenPaymasterAddress:tokenPaymasterAddress
  //   });

  //   console.log("userOpBundle", userOpBundle);

  //   const txHash = await smartAccount.sendUserOperation({
  //     userOp:userOpBundle.userOp,
  //     userOpHash:userOpBundle.userOpHash,
  //   });
  // };

  // const { writeAsync: mintNft } = useScaffoldContractWrite({
  //   contractName: "MutantsNft",
  //   functionName: "mintNft",
  //   blockConfirmations: 1,
  // });

  const { data: nftCounter } = useScaffoldContractRead({
    contractName: "MutantsNft",
    functionName: "getTokenCounter",
    watch: true,
  });

  function onClickFiat() {
    if (particleInstance)
      particleInstance.openBuy({
        walletAddress: connectedAddress,
        network: String(accountState.connector?.chains[0].id),
      });
  }

  async function fundSmartAccount(value: string) {
    if (smartAccountAddress && value) {
      setIsLoadingFundingSA(true);
      await sendTransactionAsync({ to: smartAccountAddress, value: parseEther(value) });
      setIsLoadingFundingSA(false);
    }
  }

  // async function mint() {
  //   setIsMinting(true);
  //   const callData = encodeFunctionData({
  //     abi:mutantsNftContract.data?.abi,
  //     functionName: 'mintNft'
  //   })

  //   const txs = [
  //     {
  //       to: '0x35b5c6C63F0a23649f7E0859568DA93eEa0e1ae8',
  //       data: callData
  //     }
  //   ]

  //   const feeQuotesResult = await smartAccount.getFeeQuotes(txs);

  //   const tokenPaymasterAddress = await smartAccount.getAddress();
  //   const feeQuote = feeQuotesResult.verifyingPaymasterNative.feeQuote;

  //   const userOpBundle = await smartAccount.buildUserOperation({
  //     tx:txs,
  //     // feeQuote:feeQuote,
  //     // tokenPaymasterAddress:tokenPaymasterAddress
  //   });

  //   console.log("userOpBundle", userOpBundle);

  //   const txHash = await smartAccount.sendUserOperation({
  //     userOp:userOpBundle.userOp,
  //     userOpHash:userOpBundle.userOpHash,
  //   });
  //   console.log(txHash)
  //   setIsMinting(false);
  // }

  useEffect(() => {
    switch (status) {
      case "error": {
        notification.error(error?.message);
      }
      case "success": {
        notification.success("Transaction succeeded.");
      }
      case "loading": {
        notification.info("Transaction sent.");
      }
    }
  }, [isConfirming, status, error]);

  const { data: mintEvents } = useScaffoldEventHistory({
    contractName: "MutantsNft",
    eventName: "NftMinted",
    fromBlock: scaffoldConfig.fromBlock,
    watch: true,
    filters: { minter: smartAccountAddress },
  });

  useEffect(() => {
    console.log(mintEvents);
    if (mintEvents) {
      const eventsArgs: any = mintEvents.map(event => event.args);
      const uris: any[] = [];
      eventsArgs.forEach(async (element: any) => {
        await fetch(element.tokenUri).then(async res => {
          const jsonRes = await res.json();
          jsonRes.image = jsonRes.image.split("/")[2];
          jsonRes["tokenId"] = element.tokenId;
          uris.push(jsonRes);
        });
        // setTokensUris(uris);
      });
    }
  }, [mintEvents]);

  // const handleCardClick = (nftId: string) => {
  //   setSelectedNft(nftId);
  // };

  async function onMintandSendNft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoadingSendNft(true);
    if (!isAddress(receipientAddress)) {
      setIsLoadingSendNft(false);
      notification.error("Inputs are not valid.");
      return;
    }

    const callDataMint = encodeFunctionData({
      // @ts-ignore
      abi: mutantsNftContract.data?.abi,
      functionName: "mintNft",
    });

    const callDataTransfer = encodeFunctionData({
      // @ts-ignore
      abi: mutantsNftContract.data?.abi,
      functionName: "transferFrom",
      args: [smartAccountAddress, receipientAddress, nftCounter],
    });

    const txs = [
      {
        to: "0x35b5c6C63F0a23649f7E0859568DA93eEa0e1ae8",
        data: callDataMint,
      },
      {
        to: "0x35b5c6C63F0a23649f7E0859568DA93eEa0e1ae8",
        data: callDataTransfer,
      },
    ];

    // const feeQuotesResult = await smartAccount.getFeeQuotes(txs);

    // const tokenPaymasterAddress = await smartAccount.getAddress();
    // const feeQuote = feeQuotesResult.verifyingPaymasterNative.feeQuote;
    // @ts-ignore
    const userOpBundle = await smartAccount.buildUserOperation({
      tx: txs,
      // feeQuote:feeQuote,
      // tokenPaymasterAddress:tokenPaymasterAddress
    });

    console.log("userOpBundle", userOpBundle);
    // @ts-ignore
    const txHash = await smartAccount.sendUserOperation({
      userOp: userOpBundle.userOp,
      userOpHash: userOpBundle.userOpHash,
    });
    console.log(txHash);

    setIsLoadingSendNft(false);
  }

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="w-100 "></div>
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-4xl font-bold">Smart Account</span>
          </h1>
          <div className="flex flex-col justify-center items-center space-y-3">
            <div className="flex flex-row space-x-2">
              <p className="my-2 font-medium">Connected Address:</p>
              <Address address={connectedAddress} />
            </div>
            {/* {(accountBalance == 0 && accountState.connector?.name == 'Particle') ? ( */}
            <div className="flex flex-row items-center">
              {" "}
              You&apos;re balance is <Balance address={connectedAddress} /> consider buying using fiat :{" "}
              <button
                className="btn btn-primary h-8 min-h-max m-l-1"
                type="button"
                onClick={() => {
                  onClickFiat();
                }}
              >
                Buy Crypto
              </button>
            </div>
            {/* ) : (<> </>)} */}
            {smartAccountAddress && smartAccountBalance != null ? (
              <div className="flex flex-row items-center">
                <div className="flex flex-row space-x-2">
                  <p className="my-2 font-medium">Smart Account Address:</p>
                  <Address address={smartAccountAddress} />
                </div>
                <Balance address={smartAccountAddress} />
              </div>
            ) : (
              <></>
            )}
            <div className="flex flex-row space-x-2">
              <EtherInput
                onChange={value => {
                  setSmartAccountSendValue(value);
                }}
                value={smartAccountSendValue}
                placeholder="Ether"
              />
              <Button
                color="blue"
                text="Supply your Smart Account"
                theme="colored"
                isFullWidth={true}
                radius={10}
                isLoading={isLoadingFundingSA}
                onClick={async () => {
                  await fundSmartAccount(smartAccountSendValue);
                }}
              />
            </div>

            {/* <h1 className="text-center mt-2">
              <span className="block text-4xl font-bold">Mint</span>
            </h1>
            <Button 
                  color="blue"
                  text="Mint NFT"
                  theme="colored"
                  isFullWidth={false}
                  radius={10}
                  isLoading={isMinting}
                  onClick={async () => {await mint()}}/>
            <h1 className="text-center mt-2">
              <span className="block text-4xl font-bold">Minted NFTs</span>
            </h1>
            {tokensUris && tokensUris.length > 0 ? (
              <>
                <div className="grid grid-cols-6 p-2 gap-4 justify-between rounded-lg border-2 border-black">
                  {tokensUris.map((tokenUri: any, index) => (
                        <div key={index}>
                          <Card
                            key={`${tokenUri.tokenId}`}
                            id={`${tokenUri.tokenId}`}
                            onClick={() => handleCardClick(`${tokenUri.tokenId}`)}
                            title={tokenUri.name}
                            isSelected={
                              selectedNft === `${tokenUri.tokenId}` ? true : false
                            }
                          >
                            <div className="mb-2">
                              <img className="rounded-lg" src={`https://ipfs.io/ipfs/${tokenUri.image}`} />
                            </div>
                          </Card>
                        </div>
                      ))}
                </div>
              </>

            ) : (
              <span>You have no minted NFTs</span>
            ) } */}
            <div className="mt-3">
              <h1 className="text-center mt-2">
                <span className="block text-4xl font-bold">Mint and transfer your NFT</span>
              </h1>
              <div>
                <form
                  className="space-y-2"
                  onSubmit={async event => {
                    await onMintandSendNft(event);
                  }}
                >
                  <AddressInput
                    onChange={value => {
                      setReceipientAddress(value);
                    }}
                    value={receipientAddress}
                    placeholder="Receipient's address"
                  />
                  <Button
                    text="Send NFT"
                    theme="primary"
                    type="submit"
                    isLoading={isLoadingSendNft}
                    disabled={receipientAddress == "" ? true : false}
                  />
                </form>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <BugAntIcon className="h-8 w-8 fill-secondary" />
              <p>
                Tinker with your smart contract using the{" "}
                <Link href="/debug" passHref className="link">
                  Debug Contract
                </Link>{" "}
                tab.
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <MagnifyingGlassIcon className="h-8 w-8 fill-secondary" />
              <p>
                Explore your local transactions with the{" "}
                <Link href="/blockexplorer" passHref className="link">
                  Block Explorer
                </Link>{" "}
                tab.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
