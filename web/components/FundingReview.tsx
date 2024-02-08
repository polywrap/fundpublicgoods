"use client";

import { useState } from "react";
import FundingTable, { FundingEntry } from "./FundingTable";
import Button from "./Button";
import clsx from "clsx";
import { useConnectWallet } from "@web3-onboard/react";
import { ethers } from "ethers";
import {
  NetworkName,
  getTokensForNetwork,
  splitTransferFunds,
} from "@/utils/ethereum";
import { useRouter } from "next/navigation";
import { donationPlan } from "@/hooks/useStrategiesHandler";
import { useAtom } from "jotai";
import {
  ArrowLeft,
  ArrowRight,
  CaretRight,
  Info,
} from "@phosphor-icons/react/dist/ssr";

export default function FundingReview(props: { id: string }) {
  const [plan] = useAtom<FundingEntry | undefined>(donationPlan);
  const router = useRouter();
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [isTransferPending, setIsTransferPending] = useState(false);
  const [{ wallet }] = useConnectWallet();

  if (!plan) {
    router.push("/s/" + props.id);
    return;
  }

  async function transferFunds() {
    if (!wallet || isTransferPending) return;
    const ethersProvider = new ethers.providers.Web3Provider(
      wallet.provider,
      "any"
    );

    const signer = ethersProvider.getSigner();

    setIsTransferPending(true);

    // TODO: Handle interaction of funding in multiple chains
    const {
      network: selectedNetwork,
      token: selectedToken,
      donations,
    } = plan as FundingEntry;
    const token = getTokensForNetwork(selectedNetwork as NetworkName).find(
      (t) => t.name == selectedToken.name
    );

    if (!token) {
      throw new Error(`Token with name: ${selectedToken} is not valid`);
    }
    const amounts = donations.map((d) => Number(d.amount));
    console.log(plan, amounts, signer, token);
    try {
      await splitTransferFunds(
        donations.map((d) => d.recipient),
        amounts,
        signer,
        token.address,
        token.decimals
      );
    } catch (e) {
      throw e;
    } finally {
      setIsTransferPending(false);
    }
  }

  const totalAmount = plan.donations.reduce((acc, x) => {
    return acc + Number(x.amount);
  }, 0);

  return (
    <div
      className={clsx(
        "flex flex-col py-12 w-full items-center px-6",
        !showBreakdown && "h-full"
      )}
    >
      <div className="w-full mx-auto max-w-screen-sm space-y-8">
        <div
          className="flex items-center space-x-2 cursor-pointer hover:text-indigo-500 text-xs"
          onClick={() => {
            router.push("./");
            router.refresh();
          }}
        >
          <ArrowLeft size={16} weight="bold" />
          <div className="underline">Edit</div>
        </div>
        <div>Great! I&apos;ve setup the transactions for you below.</div>
        <div className="space-y-1 w-full">
          <div className="font-bold text-sm text-subdued">
            Transaction Overview
          </div>
          <div className="p-6 bg-indigo-25 rounded-2xl border-2 border-indigo-200 space-y-6 ">
            <div className="grid grid-cols-12 w-full items-center">
              <div className="flex flex-col col-span-5">
                <div className="rounded-xl p-4 border-2 border-indigo-100 bg-white leading-none space-y-2">
                  <div className="text-[10px] text-indigo-400 uppercase tracking-wider leading-none">
                    Sending
                  </div>
                  <div className="text-md leading-none text-indigo-600 font-bold">
                    {totalAmount.toFixed(2)}
                    <span className="ml-1 text-xs text-subdued">USDC</span>
                  </div>
                </div>
              </div>
              <div className="col-span-2 flex justify-center text-indigo-600">
                <ArrowRight size={20} weight="bold" />
              </div>
              <div className="flex flex-col col-span-5">
                <div className="rounded-xl p-4 border-2 border-indigo-100 bg-white leading-none space-y-2">
                  <div className="text-[10px] text-indigo-400 uppercase tracking-wider leading-none">
                    Recipient
                  </div>
                  <div className="text-md leading-none text-indigo-600">
                    {plan.donations.length} projects
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div
                className="text-xs font-bold text-indigo-600 hover:text-indigo-500 cursor-pointer flex items-center space-x-1"
                onClick={() => setShowBreakdown(!showBreakdown)}
              >
                <div>View funding breakdown</div>
                <CaretRight
                  size={14}
                  weight="bold"
                  className={clsx(
                    "text-[currentColor] transform transition-transform",
                    showBreakdown && "-rotate-90"
                  )}
                />
              </div>
              {showBreakdown && <FundingTable plan={plan} />}
            </div>
            <div className="flex flex-wrap justify-between pt-6 border-t-2 border-indigo-100 text-subdued text-xs">
              <div>
                <strong className="mr-1">Gas:</strong>
                0.001295 ETH
              </div>
              <Info
                size={16}
                weight="bold"
                className="hover:text-indigo-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap justify-between w-full">
          <div className="space-y-1">
            <div>Funding {plan.donations.length} projects</div>
            <div className="text-[12px] text-slate-500">
              With a total funding of {totalAmount.toFixed(2)} {plan.token.name}
            </div>
          </div>
          <Button onClick={transferFunds}>Submit</Button>
        </div>
      </div>
    </div>
  );
}
