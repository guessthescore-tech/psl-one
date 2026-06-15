export interface WebRuntimeMetadata {
  service: 'web';
  status: 'ok';
  version: string;
  environment: string;
  gitSha: string;
  buildTimestamp: string;
}

export function getWebRuntimeMetadata(): WebRuntimeMetadata {
  return {
    service: 'web',
    status: 'ok',
    version: process.env['NEXT_PUBLIC_APP_VERSION'] ?? '0.1.0',
    environment: process.env['NEXT_PUBLIC_ENVIRONMENT_LABEL'] ?? process.env['NODE_ENV'] ?? 'development',
    gitSha: process.env['NEXT_PUBLIC_GIT_SHA'] ?? 'local',
    buildTimestamp: process.env['NEXT_PUBLIC_BUILD_TIMESTAMP'] ?? 'local',
  };
}
