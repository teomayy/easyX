import axios, { AxiosInstance } from 'axios';

export interface RpcResponse<T = unknown> {
  result: T;
  error: { code: number; message: string } | null;
  id: string | number;
}

export class BitcoinRpcClient {
  private client: AxiosInstance;

  constructor(
    private readonly host: string,
    private readonly port: number,
    private readonly username: string,
    private readonly password: string,
  ) {
    this.client = axios.create({
      baseURL: `http://${host}:${port}`,
      auth: { username, password },
      headers: { 'Content-Type': 'application/json' },
    });
  }

  private async call<T>(method: string, params: unknown[] = []): Promise<T> {
    const response = await this.client.post<RpcResponse<T>>('/', {
      jsonrpc: '1.0',
      id: Date.now(),
      method,
      params,
    });

    if (response.data.error) {
      throw new Error(`RPC Error: ${response.data.error.message}`);
    }

    return response.data.result;
  }

  // Wallet methods
  async getNewAddress(label = ''): Promise<string> {
    return this.call<string>('getnewaddress', [label]);
  }

  async getAddressesByLabel(label: string): Promise<Record<string, { purpose: string }>> {
    return this.call('getaddressesbylabel', [label]);
  }

  async validateAddress(address: string): Promise<{
    isvalid: boolean;
    address: string;
    ismine: boolean;
  }> {
    return this.call('validateaddress', [address]);
  }

  // Transaction methods
  async getTransaction(txid: string): Promise<{
    txid: string;
    confirmations: number;
    amount: number;
    details: Array<{
      address: string;
      category: string;
      amount: number;
    }>;
  }> {
    return this.call('gettransaction', [txid]);
  }

  async getRawTransaction(txid: string, verbose = true): Promise<{
    txid: string;
    confirmations: number;
    vout: Array<{
      value: number;
      n: number;
      scriptPubKey: {
        address?: string;
        addresses?: string[];
      };
    }>;
  }> {
    return this.call('getrawtransaction', [txid, verbose]);
  }

  async listTransactions(
    label = '*',
    count = 100,
    skip = 0,
  ): Promise<
    Array<{
      address: string;
      category: string;
      amount: number;
      confirmations: number;
      txid: string;
      time: number;
    }>
  > {
    return this.call('listtransactions', [label, count, skip]);
  }

  async listUnspent(
    minconf = 1,
    maxconf = 9999999,
    addresses: string[] = [],
  ): Promise<
    Array<{
      txid: string;
      vout: number;
      address: string;
      amount: number;
      confirmations: number;
    }>
  > {
    return this.call('listunspent', [minconf, maxconf, addresses]);
  }

  // Block methods
  async getBlockCount(): Promise<number> {
    return this.call<number>('getblockcount');
  }

  async getBlock(blockhash: string): Promise<{
    hash: string;
    height: number;
    tx: string[];
    time: number;
  }> {
    return this.call('getblock', [blockhash]);
  }

  async getBlockHash(height: number): Promise<string> {
    return this.call<string>('getblockhash', [height]);
  }

  async getBestBlockHash(): Promise<string> {
    return this.call<string>('getbestblockhash');
  }

  // Sending
  async sendToAddress(
    address: string,
    amount: number,
    comment = '',
    commentTo = '',
    subtractFee = false,
  ): Promise<string> {
    return this.call<string>('sendtoaddress', [
      address,
      amount,
      comment,
      commentTo,
      subtractFee,
    ]);
  }

  async estimateSmartFee(confTarget = 6): Promise<{
    feerate: number;
    blocks: number;
  }> {
    return this.call('estimatesmartfee', [confTarget]);
  }

  // Network info
  async getNetworkInfo(): Promise<{
    version: number;
    subversion: string;
    connections: number;
  }> {
    return this.call('getnetworkinfo');
  }

  async getBlockchainInfo(): Promise<{
    chain: string;
    blocks: number;
    headers: number;
    bestblockhash: string;
    verificationprogress: number;
  }> {
    return this.call('getblockchaininfo');
  }
}
