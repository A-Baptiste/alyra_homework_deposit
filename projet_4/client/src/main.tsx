import ReactDOM from 'react-dom/client';
import App from './App';
import { WagmiConfig, createClient, configureChains } from 'wagmi';
import { hardhat, goerli } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import {
  getDefaultWallets,
  RainbowKitProvider,
  lightTheme,
} from '@rainbow-me/rainbowkit';
import './index.css';
import '@rainbow-me/rainbowkit/styles.css';
import 'react-toastify/dist/ReactToastify.css';

const { chains, provider } = configureChains(
  [hardhat, goerli],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: 'My RainbowKit App',
  chains,
});

const wagmiClient = createClient({
  autoConnect: false,
  connectors,
  provider,
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <WagmiConfig client={wagmiClient}>
    <RainbowKitProvider
      chains={chains}
      theme={lightTheme({
        accentColor: '#7b3fe4',
      })}
    >
      <App />
    </RainbowKitProvider>
  </WagmiConfig>
);
