function validaString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

export function validateEnv(
  config: Record<string, unknown>,
): Record<string, string> {
  const jwtSecret = config['JWT_SECRET'];
  if (typeof jwtSecret !== 'string' || jwtSecret.length === 0) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  const result: Record<string, string> = {
    JWT_SECRET: jwtSecret,
    JWT_EXPIRES_IN: validaString(config['JWT_EXPIRES_IN']) ?? '1d',
    PORT: validaString(config['PORT']) ?? '3000',
  };
  const adminEmail = validaString(config['ADMIN_EMAIL']);
  if (adminEmail !== undefined) {
    result['ADMIN_EMAIL'] = adminEmail;
  }
  const adminPassword = validaString(config['ADMIN_PASSWORD']);
  if (adminPassword !== undefined) {
    result['ADMIN_PASSWORD'] = adminPassword;
  }
  return result;
}
