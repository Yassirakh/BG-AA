import { ParticleNetwork } from "@particle-network/auth";

export const getParticleInstance = (appChains: any) => {
  /**
   * Praticle Social Auth Provider
   */
  const particleProjectId = process.env.NEXT_PUBLIC_PRACTILE_PROJECT_ID || "";
  const particleClientKey = process.env.NEXT_PUBLIC_PRACTILE_CLIENT_KEY || "";
  const particleAppId = process.env.NEXT_PUBLIC_PRACTILE_APP_ID || "";
  const isPractile = particleProjectId && particleClientKey && particleAppId ? true : false;
  let particleInstance: ParticleNetwork | null = null;
  if (isPractile) {
    particleInstance = new ParticleNetwork({
      projectId: particleProjectId,
      clientKey: particleClientKey,
      appId: particleAppId,
      chainName: appChains.chains[0].name == "Sepolia" ? "ethereum" : appChains.chains[0].name,
      chainId: appChains.chains[0].id,
      wallet: { displayWalletEntry: false },
    });
  }
  return particleInstance;
};
