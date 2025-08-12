import * as React from "react";

const WalletIcon = (props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={26} height={23} viewBox="0 0 26 23" fill="none" {...props}>
    <path
      fill="currentColor"
      d="M22.71 5V2.5c0-1.379-1.122-2.5-2.5-2.5H3.96A3.755 3.755 0 0 0 .21 3.75v15c0 2.751 2.242 3.75 3.75 3.75h18.75c1.378 0 2.5-1.121 2.5-2.5V7.5c0-1.379-1.122-2.5-2.5-2.5ZM3.96 2.5h16.25V5H3.96a1.251 1.251 0 0 1 0-2.5ZM22.71 20H3.973c-.577-.015-1.265-.244-1.265-1.25V7.269c.393.141.809.231 1.25.231h18.75V20Z"
    />
  </svg>
);
export default WalletIcon;
