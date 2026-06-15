export interface RuntimeMetadata {
  version: string;
  environment: string;
  environmentLabel: string;
  gitSha: string;
  buildTimestamp: string;
}

export function getRuntimeMetadata(): RuntimeMetadata {
  return {
    version: process.env['APP_VERSION'] ?? '0.1.0',
    environment: process.env['NODE_ENV'] ?? 'development',
    environmentLabel: process.env['ENVIRONMENT_LABEL'] ?? process.env['NODE_ENV'] ?? 'development',
    gitSha: process.env['GIT_SHA'] ?? 'local',
    buildTimestamp: process.env['BUILD_TIMESTAMP'] ?? 'local',
  };
}
