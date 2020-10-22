// import Cookies from 'universal-cookie';
// const cookies = new Cookies();
//
// function resolveAfter2Seconds() {
//   return new Promise(resolve => {
//     setTimeout(() => {
//       resolve('resolved');
//     }, 2000);
//   });
// }
//
// window.edgeTesting = true;
// export function initializeEdgeTest() {
//   setTimeout(() => {
//     window.edgeProvider = {
//       getWalletHistory: async () => {
//         await resolveAfter2Seconds();
//         return {
//           fiatCurrencyCode: "iso:USD",
//           balance: "0.0",
//           transactions: [
//             {
//               currencyCode: "iso:BTC",
//               nativeAmount: "2",
//               networkFee: "-0.05",
//               parentNetworkFee: null,
//               blockHeight: 1234,
//               date: 1585008005,
//               txid: "0x123456789",
//               ourReceiveAddresses: ["asdads", "Asdadadasda"],
//               metadata: null
//             },
//             {
//               currencyCode: "iso:BTC",
//               nativeAmount: "2.5",
//               networkFee: "-0.05",
//               parentNetworkFee: "-0.25",
//               blockHeight: 1234,
//               date: 1585008005,
//               txid: "0x123456789",
//               ourReceiveAddresses: ["asdads", "Asdadadasda"],
//               metadata: {
//                 name: null,
//                 category: "income",
//                 amountFiat: 2000
//               }
//             }
//           ]
//         }
//       },
//       readData: async () => {
//         await resolveAfter2Seconds();
//         return {
//           email: cookies.get('edge-email'),
//           password: cookies.get('edge-password')
//         }
//       },
//       writeData: async (params) => {
//         await resolveAfter2Seconds();
//         cookies.set('edge-email', params.email, { path: '/' });
//         cookies.set('edge-password', params.password, { path: '/' });
//       }
//     };
//
//     document.dispatchEvent(new Event("edgeProviderReady"))
//   });
// }
