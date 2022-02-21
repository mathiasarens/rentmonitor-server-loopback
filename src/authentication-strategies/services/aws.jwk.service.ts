export interface AwsJwkService {
  fetchJwk(): Promise<void>;
  getPems(): Promise<string[]>;
}
