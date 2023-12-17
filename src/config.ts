import { IConfig } from './types';

export function makeConfig(penv = process.env): IConfig {
  return penv;
}
