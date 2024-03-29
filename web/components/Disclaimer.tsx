"use client";

import { X } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";

const Disclaimer = () => {
  const [showDisclaimer, setShowDisclaimer] = useState<boolean>(true);
  return showDisclaimer ? (
    <div className='px-6'>
      <div className='fixed bottom-16 left-1/2 transform -translate-x-1/2 max-w-screen-sm w-[calc(100%-48px)] z-10'>
        <X
          onClick={() => setShowDisclaimer(false)}
          className='absolute top-3 right-3 text-indigo-800 hover:text-indigo-500 cursor-pointer'
          size={20}
          weight='bold'
        />
        <div className='p-6 bg-indigo-25 rounded-2xl border-2 border-indigo-200 space-y-1 shadow-md shadow-primary-shadow/20'>
          <div className='font-bold text-sm'>
            This AI agent is experimental.
          </div>
          <div className='text-[10px]'>
            The agent is evaluating projects based on self-reported data through
            past Gitcoin applications and therefore cannot guarantee their
            accuracy at this time. The agent also cannot guarantee that each
            project is still in control of its address, so please double check
            before sending large amounts.
          </div>
        </div>
      </div>
    </div>
  ) : null;
};

export default Disclaimer;
