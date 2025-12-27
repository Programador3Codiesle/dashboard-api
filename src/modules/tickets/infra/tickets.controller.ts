
import { Controller, Get, Post, Put, Body, Param, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TicketFacade } from '../application/ticket.facade';
import { CreateTicketDto, CreateRespuestaDto, ReasignarTicketDto } from '../application/dto/create-ticket.dto';
import { UpdateTicketDto , reponderTicketDto} from '../application/dto/update-ticket.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('tickets')
export class TicketController {
    constructor(private readonly facade: TicketFacade) { }

    @Post()
    create(@Body() dto: CreateTicketDto) { return this.facade.create(dto);}

    @Get('activos')
    getActivos() { return this.facade.getActivos(); }

    @Get('finalizados')
    getFinalizados() { return this.facade.getFinalizados(); }

    @Get('mis-tickets/:userId')
    getByUsuario(@Param('userId') userId: string) { return this.facade.getByUsuario(+userId); }

    @Get(':id')
    getTicket(@Param('id') id: string) { return this.facade.getTicket(+id); }

    @Put(':id/reasignar')
    reasignar(@Param('id') id: string, @Body() dto: ReasignarTicketDto) { return this.facade.reasignar(+id, dto); }

    @Put(':id/responder')
    addRespuesta(@Param('id') id: string, @Body() dto: reponderTicketDto) { return this.facade.addRespuesta(+id, dto); }
}
