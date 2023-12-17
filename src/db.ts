import knex from 'knex';
import { IConfig, IDb, IDtoHealthCheck, IDtoHealthCheckResult, IDtoLocationHistory, IDtoLocationHistoryResult } from './types';

export async function makeDb(config: IConfig): Promise<IDb> {

  const _db = knex({
    client: config.DB_KIND,
    connection: {
      connectionString: config.DB_URL,
      host            : config.DB_HOST,
      port            : config.DB_PORT ? Number(config.DB_PORT) : 0,
      user            : config.DB_USER,
      database        : config.DB_NAME,
      password        : config.DB_PASS,
      ssl             : config.DB_SSL ? { rejectUnauthorized: false }: false,
    },
    searchPath: [config.DB_SCHEMA || 'public'],
    pool: { min: 5, max: 100 },
  });

  async function checkHealth(): Promise<IDtoHealthCheckResult> {
    let data: string | null = null, error: string | null = null;

    try {
      const res = await _db.raw<{ rows: IDtoHealthCheck[] }>("SELECT 'OK' AS status");
      //console.log('health check', res);
      data = res.rows[0].status;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown error with database';
    }

    return { data, error };
  };

  const locationHistoryTable = () => _db.table<IDtoLocationHistory>('tbl_history_location');

  async function getGocationHistory(user_id: string, after: string, limit = 10): Promise<IDtoLocationHistoryResult> {
    let data: IDtoLocationHistory[] = [], error = null;

    try {
      data = await locationHistoryTable()
        .where('user_id', user_id)
        .where('log_date', '>', after)
        .limit(limit);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown error with location history';
    }

    return { data, error };
  }

  return {
    checkHealth,
    getGocationHistory,
  };
}
