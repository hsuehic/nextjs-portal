import { sql as vercelSql } from '@vercel/postgres';
import { Client } from 'pg';

// Check if we're in development and should use local PostgreSQL
const useLocalDb = process.env.NODE_ENV === 'development' || process.env.USE_LOCAL_DB === 'true';

let localClient: Client | null = null;

// Initialize local PostgreSQL client
async function getLocalClient() {
  if (!localClient) {
    localClient = new Client({
      host: process.env.POSTGRES_HOST?.split(':')[0] || 'localhost',
      port: parseInt(process.env.POSTGRES_HOST?.split(':')[1] || '5432'),
      database: process.env.POSTGRES_DATABASE || 'postgres',
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
    });
    await localClient.connect();
  }
  return localClient;
}

// SQL template function for local PostgreSQL
async function localSql(strings: TemplateStringsArray, ...values: any[]) {
  const client = await getLocalClient();
  
  // Convert template literal to parameterized query
  let query = '';
  const params: any[] = [];
  let paramIndex = 1;
  
  for (let i = 0; i < strings.length; i++) {
    query += strings[i];
    if (i < values.length) {
      query += `$${paramIndex}`;
      params.push(values[i]);
      paramIndex++;
    }
  }
  
  const result = await client.query(query, params);
  return {
    rows: result.rows,
    rowCount: result.rowCount,
  };
}

// Export the appropriate SQL function based on environment
export const sql = useLocalDb ? localSql : vercelSql;

// Cleanup function for local client
export async function closeLocalConnection() {
  if (localClient) {
    await localClient.end();
    localClient = null;
  }
}

// Export client for direct access if needed
export { getLocalClient }; 