import { Request, Response } from 'hyper-express';

export type IProcessEnv = NodeJS.ProcessEnv;

export type IHttpRequest = Request;
export type IHttpResponse = Response;

export interface IGqlContext<TServices = { config: IConfig; db: IDb }> {
  req: IHttpRequest;
  res: IHttpResponse;
  services: TServices;
}

export interface IGraphqlCommand {
  query         : string;
  variables    ?: Record<string, unknown>;
  operationName?: string;
}

export interface IConfig extends IProcessEnv {
  HTTP_PORT?: string;

  DB_KIND  ?: string;
  DB_URL   ?: string;
  DB_HOST  ?: string;
  DB_PORT  ?: string;
  DB_USER  ?: string;
  DB_PASS  ?: string;
  DB_NAME  ?: string;
  DB_SCHEMA?: string;

  GRAPHQL_SCHEMA?: string;
}

export interface IGqlLocationHistory {
  ts            : string;
  latitude      : number;
  longitude     : number;
  radiusInMetres: number;
}

export interface IDtoHealthCheck {
  status: string;
}

export interface IDtoHealthCheckResult {
  data : string | null;
  error: string | null;
}

export interface IDtoUser {
  id: string;
  nickname: string;
}

export interface IGqlLocationHistoryArgs {
  inputs: IGqlLocationHistoryInput;
}

export interface IGqlLocationHistoryInput {
  after: string;
  limit?: number | null;
}

export interface IDtoLocationHistory {
  user_id : string;
  log_date: number;
  lat     : number;
  lng     : number;
  rad     : number;
}

export interface IDtoLocationHistoryResult {
  data : IDtoLocationHistory[];
  error: string | null;
}

export interface IDb {
  checkHealth: () => Promise<IDtoHealthCheckResult>;
  getGocationHistory: (user_id: string, after: string, limit: number) => Promise<IDtoLocationHistoryResult>;
}
