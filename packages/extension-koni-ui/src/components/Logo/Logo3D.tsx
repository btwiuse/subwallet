// Copyright 2019-2022 @polkadot/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

interface Props {
  width?: number;
  height?: number;
}

const Logo3D: React.FC<Props> = ({ height = 120, width = 83 }: Props) => {
  return (
    <svg
      fill='none'
      height={height}
      viewBox='0 0 83 120'
      width={width}
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M81.8976 49.3993L68.659 54.9129C68.1033 55.1444 67.4909 54.7363 67.4909 54.1345V40.9221C67.4909 39.9737 66.9602 39.1049 66.1161 38.6717L6.67504 8.16121C6.03693 7.83368 6.07297 6.91007 6.73466 6.6332L22.1186 0.19621C22.8045 -0.0907872 23.582 -0.0617688 24.2446 0.275561L81.2941 29.3203C82.1422 29.7521 82.6763 30.6231 82.6763 31.5745V48.2317C82.6763 48.7423 82.3691 49.2029 81.8976 49.3993Z'
        fill='currentColor'
      />
      <path
        d='M62.4291 43.8782V56.1292C62.4291 56.7594 61.7626 57.167 61.2013 56.88L13.0387 32.2598C12.4773 31.9729 11.8109 32.3804 11.8109 33.0106V50.9012C11.8109 51.8507 12.3428 52.7202 13.1883 53.153L45.2039 69.5394C45.843 69.8665 45.8072 70.7913 45.1447 71.068L33.7648 75.8217C33.0832 76.1065 32.3111 76.0793 31.6512 75.7474L1.39322 60.5274C0.538996 60.0977 0 59.2235 0 58.2676V11.8723C0 11.2424 0.665692 10.8349 1.227 11.1211L61.0482 41.6247C61.8956 42.0568 62.4291 42.9274 62.4291 43.8782Z'
        fill='currentColor'
      />
      <path
        d='M16.8727 41.3864V47.9472C16.8727 48.8981 17.4061 49.7686 18.2534 50.2007L56.6183 69.7661C57.2535 70.09 57.2251 71.0065 56.5712 71.2906L34.4238 80.9128C33.4996 81.3143 32.9018 82.2256 32.9018 83.2329V91.2665C32.9018 91.8696 33.5167 92.2777 34.0728 92.0437L78.8942 73.1798C79.5556 72.9014 79.5894 71.9772 78.9501 71.6514L18.0996 40.6352C17.5383 40.3491 16.8727 40.7566 16.8727 41.3864Z'
        fill='currentColor'
      />
      <path
        d='M1.59095 79.8506L14.7629 74.5841C15.4341 74.3157 16.1881 74.3471 16.8347 74.6702L24.2526 78.3775C24.9051 78.7036 24.8639 79.6478 24.1855 79.916L13.4111 84.1747C12.4453 84.5564 11.8109 85.4892 11.8109 86.5273V119.156C11.8109 119.788 11.1409 120.195 10.5793 119.904L1.36706 115.136C0.527266 114.701 0 113.835 0 112.889V82.1994C0 81.165 0.63007 80.2348 1.59095 79.8506Z'
        fill='currentColor'
      />
      <path
        d='M26.4642 84.3392L18.44 87.6419C17.4916 88.0322 16.8727 88.956 16.8727 89.9811V119.059C16.8727 119.662 17.4888 120.071 18.0451 119.835L81.1315 93.1565C82.0679 92.7605 82.6763 91.8429 82.6763 90.8267V78.3886C82.6763 77.7842 82.0589 77.3761 81.5025 77.6126L29.3898 99.7658C28.5551 100.121 27.6291 99.5084 27.6291 98.6018V85.1189C27.6291 84.5187 27.0195 84.1106 26.4642 84.3392Z'
        fill='currentColor'
      />
    </svg>
  );
};

export default Logo3D;