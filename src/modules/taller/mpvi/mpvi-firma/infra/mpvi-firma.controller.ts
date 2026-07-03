import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MpviFirmaFacade } from '../application/mpvi-firma.facade';
import { CargarFirmaDto } from '../application/dto/mpvi-firma.dto';

@Controller('taller/mpvi/firma')
export class MpviFirmaController {
  constructor(private readonly facade: MpviFirmaFacade) {}

  @Get('validar-token')
  validarToken(@Query('token') token: string) {
    if (!token?.trim()) {
      throw new BadRequestException('token requerido');
    }
    return this.facade.validarToken(token);
  }

  @Post('firmar')
  @UseInterceptors(FileInterceptor('img_firma_user'))
  cargarFirma(
    @Body() dto: CargarFirmaDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.facade.cargarFirma(dto, file);
  }

  @Get('pdf')
  async imprimirMpvi(@Query('token') token: string) {
    if (!token?.trim()) {
      throw new BadRequestException('token requerido');
    }
    const buffer = await this.facade.imprimirMpviCliente(token);
    return new StreamableFile(buffer, {
      type: 'application/pdf',
      disposition: 'inline; filename="cotizacion-cliente.pdf"',
    });
  }
}
