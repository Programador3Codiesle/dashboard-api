import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { assertCodieselEmpresa } from './assert-codiesel.util';

@Injectable()
export class CodieselEmpresaGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    assertCodieselEmpresa(context.switchToHttp().getRequest());
    return true;
  }
}
