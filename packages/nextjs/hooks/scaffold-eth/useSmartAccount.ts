import { Web3Provider } from "@ethersproject/providers";
import { SmartAccount, SmartAccountConfig } from "@particle-network/aa";
import { ParticleProvider } from "@particle-network/provider";
import { getParticleInstance } from "~~/services/web3/particleSocialAuth";
import { appChains } from "~~/services/web3/wagmiConnectors";

const config = {
  projectId: process.env.NEXT_PUBLIC_PRACTILE_PROJECT_ID || "",
  clientKey: process.env.NEXT_PUBLIC_PRACTILE_CLIENT_KEY || "",
  appId: process.env.NEXT_PUBLIC_PRACTILE_APP_ID || "",
};

const smartAccountConfig: SmartAccountConfig = {
  ...config,
  aaOptions: {
    accountContracts: {
      // BICONOMY : [{ chainIds: [11155111], version: '1.0.0' }, { chainIds: [11155111], version: '2.0.0' }],
      SIMPLE: [{ chainIds: [11155111], version: "1.0.0" }],
    },
    // paymasterApiKeys: [{
    //   chainId : 11155111,
    //   apiKey : 'SzpA3kgPQ.8257e049-38ec-41e3-be56-350b8f9dbf96'
    // }]
  },
};

export const useSmartAccount = async (accountState: any) => {
  // const [provider, setProvider] = useState<any>();
  // const [smartAccount, setSmartAccount] = useState<SmartAccount>();
  // const [particleInstance, setParticleInstance] = useState<any>();
  let provider, smartAccount;
  const particleInstance = getParticleInstance(appChains);
  if (accountState.connector?.name == "Particle") {
    if (particleInstance != null) {
      provider = new Web3Provider(new ParticleProvider(particleInstance.auth));
      smartAccount = new SmartAccount(new ParticleProvider(particleInstance.auth), smartAccountConfig);
    }
  } else if (accountState.connector?.name) {
    provider = await accountState.connector?.getProvider();
    smartAccount = new SmartAccount(provider, smartAccountConfig);
  }
  if (particleInstance)
    particleInstance.setERC4337({
      name: "SIMPLE",
      version: "1.0.0",
    });
  // useAccount({
  //     async onConnect({ connector }) {
  //     }
  //   });
  return { provider, smartAccount, particleInstance };
};
