import type { INestApplication } from '@nestjs/common';

export function logHttpRoutesExpress(app: INestApplication) {
  const adapter: any = (app as any).getHttpAdapter?.();
  const express = adapter?.getInstance?.();
  const router = express?._router;
  if (!router?.stack) {
    console.log(
      '[Routes] Express router no disponible (¿solo GraphQL middleware?)',
    );
    return;
  }
  const routes: string[] = [];
  for (const layer of router.stack) {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods)
        .filter((m) => layer.route.methods[m])
        .map((m) => m.toUpperCase())
        .join(',');
      routes.push(`${methods} ${layer.route.path}`);
    }
  }
  console.log('[Routes]', routes.sort().join(' | '));
}
