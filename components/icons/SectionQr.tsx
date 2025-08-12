import * as React from "react";

const SectionQrIcon = (props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 300 300" fill="none" {...props}>
    <path
      fill="#fff"
      d="M0 275h4v21h21v4H0v-25Zm300 25h-25v-4h21v-21h4v25ZM25 0v4H4v21H0V0h25Zm275 25h-4V4h-21V0h25v25Z"
    />
  </svg>
);
export default SectionQrIcon;
