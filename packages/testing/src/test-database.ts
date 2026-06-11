import { PostgreSqlContainer, StartedPostgreSqlContainer } from 'testcontainers';

let container: StartedPostgreSqlContainer | null = null;

export async function startTestDatabase(): Promise<string> {
  container = await new PostgreSqlContainer('postgres:16-alpine')
    .withDatabase('psl_test')
    .withUsername('postgres')
    .withPassword('postgres')
    .start();
  return container.getConnectionUri();
}

export async function stopTestDatabase(): Promise<void> {
  await container?.stop();
  container = null;
}
