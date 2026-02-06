import { BrowserProvider, Signer, Contract, ZeroAddress } from 'ethers';

export type WalletType = 'eoa' | 'safe' | 'unknown';

export interface WalletInfo {
  type: WalletType;
  address: string;
  chainId: number;
  provider?: BrowserProvider;
  signer?: Signer;
  isSafe: boolean;
}

const SAFE_SENTINEL = '0x0000000000000000000000000000000000000001';

export async function detectWalletType(): Promise<WalletInfo> {
  if (!window.ethereum) {
    return { type: 'unknown', address: '', chainId: 1, isSafe: false };
  }

  try {
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);

    // Check if connected to a Safe
    const isSafe = await checkIfSafe(address, provider);

    return {
      type: isSafe ? 'safe' : 'eoa',
      address,
      chainId,
      provider,
      signer,
      isSafe,
    };
  } catch (error) {
    console.error('Error detecting wallet type:', error);
    return { type: 'unknown', address: '', chainId: 1, isSafe: false };
  }
}

export async function checkIfSafe(address: string, provider: BrowserProvider): Promise<boolean> {
  try {
    // A Safe is a contract with a specific function signature
    const code = await provider.getCode(address);
    if (code === '0x') return false; // EOA

    // Try to call a Safe-specific function (getOwners)
    const safeAbi = ['function getOwners() view returns (address[])'];
    const safeContract = new Contract(address, safeAbi, provider);
    
    try {
      const owners = await safeContract.getOwners();
      return Array.isArray(owners) && owners.length > 0;
    } catch {
      return false;
    }
  } catch {
    return false;
  }
}

export async function requestAccounts(): Promise<string[]> {
  if (!window.ethereum) throw new Error('No wallet detected');
  try {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    return accounts;
  } catch (error) {
    console.error('Error requesting accounts:', error);
    throw error;
  }
}

export function getSafeAddress(): string | null {
  // Safe address is stored in window.ethereum.selectedAddress or via Safe SDK
  if ((window as any).ethereum?.isSafe) {
    return (window as any).ethereum?.selectedAddress || null;
  }
  return null;
}

export function isSafeEnvironment(): boolean {
  return (window as any).ethereum?.isSafe === true;
}
