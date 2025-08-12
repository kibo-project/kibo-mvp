import * as React from "react";

const PlaneIcon = (props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={25} viewBox="0 0 24 25" fill="none" {...props}>
    <path
      fill="#fff"
      d="M23.781.719a.75.75 0 0 1 .165.81l-8.729 21.82a1.124 1.124 0 0 1-1.993.186l-4.767-7.492-7.492-4.767a1.125 1.125 0 0 1 .186-1.995L22.97.555a.75.75 0 0 1 .81.165V.72ZM9.954 15.605l4.141 6.507 7.1-17.748L9.954 15.605Zm10.18-12.302-17.747 7.1 6.508 4.14 11.24-11.24Z"
    />
  </svg>
);
export default PlaneIcon;
