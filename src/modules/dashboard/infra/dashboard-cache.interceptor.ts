import { CacheInterceptor } from '@nestjs/cache-manager';
import { ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class DashboardCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    const req = context.switchToHttp().getRequest<{
      url?: string;
      user?: { sub?: string };
    }>();
    const sub = req.user?.sub ?? 'anon';
    return `dashboard:${sub}:${req.url ?? ''}`;
  }
}
