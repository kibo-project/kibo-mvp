import React from "react";

// import { hardhat } from "viem/chains";
// import { CurrencyDollarIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
// import { Faucet } from "~~/components/scaffold-eth";
// import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
// import { useGlobalState } from "~~/services/store/store";

/**
 * Site footer
 */
export const Footer = () => {
  // const nativeCurrencyPrice = useGlobalState(state => state.nativeCurrency.price);
  // const { targetNetwork } = useTargetNetwork();
  // const isLocalNetwork = targetNetwork.id === hardhat.id;

  const socialLinks = [
    { name: "Website", url: "https://kibo.doneber.dev" },
    { name: "Twitter", url: "https://x.com/kibo_app" },
    { name: "YouTube", url: "https://www.youtube.com/channel/UCMBkjEfJpsHE9GtJrf_XWwA" },
  ];

  return (
    <div className="hidden md:flex flex-col-reverse md:flex-row min-h-0 py-5 px-1">
      {/* <div>
        <div className="flex justify-between items-center w-full z-10 p-4 bottom-0 left-0 pointer-events-none">
          <div className="flex flex-row mb-10 md:mb-0 gap-2 pointer-events-auto">
            {nativeCurrencyPrice > 0 && (
              <div>
                <div className="btn btn-primary btn-sm font-normal gap-1 cursor-auto text-white">
                  <CurrencyDollarIcon className="h-4 w-4" />
                  <span>{nativeCurrencyPrice.toFixed(2)}</span>
                </div>
              </div>
            )}
            {isLocalNetwork && (
              <>
                <Faucet />
                <Link href="/blockexplorer" passHref className="btn btn-primary btn-sm font-normal gap-1 text-white">
                  <MagnifyingGlassIcon className="h-4 w-4" />
                  <span>Block Explorer</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div> */}
      <div className="w-full flex justify-center items-center">
        <ul className="menu menu-horizontal w-full">
          <div className="flex justify-center items-center gap-2 text-sm w-full">
            {socialLinks.map((link, idx) => (
              <React.Fragment key={link.name}>
                <div className="text-center">
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="link">
                    {link.name}
                  </a>
                </div>
                {idx < socialLinks.length - 1 && <span>·</span>}
              </React.Fragment>
            ))}
          </div>
        </ul>
      </div>
    </div>
  );
};
