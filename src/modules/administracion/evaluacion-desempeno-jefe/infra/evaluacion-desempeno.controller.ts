import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { EvaluacionDesempenoFacade } from '../application/evaluacion-desempeno.facade';
import { CreateEvaluacionDesempenoDto } from '../application/dto/create-evaluacion-desempeno.dto';
import { CalificarEmpleadoDto } from '../application/dto/calificar-empleado.dto';
import { RelacionarEvaluacionDto } from '../application/dto/relacionar-evaluacion.dto';
import { JwtAuthGuard } from '../../../auth/infra/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('administracion/evaluacion-desempeno')
export class EvaluacionDesempenoController {
    constructor(private readonly facade: EvaluacionDesempenoFacade) {}


    @Get('jefe/:jefeId/empleados-pendientes')
    listarEmpleadosPendientes(@Param('jefeId') jefeId: string) {
        return this.facade.listarEmpleadosPendientes(Number(jefeId));
    }

    @Get('empleado/:id')
    obtenerPorNit(@Param('id') id: string) {
        return this.facade.obtenerEvaluacionPorId(Number(id));
    }

    @Get('obtener-id-jefe/:nit_usuario')
    obtenerIdJefe(@Param('nit_usuario') nit_usuario: string) {
        return this.facade.obtenerIdJefe(Number(nit_usuario));
    }

    @Put(':id/calificar')
    calificarEmpleado(@Param('id') id: string, @Body() dto: CalificarEmpleadoDto) {
        return this.facade.calificarEmpleado(BigInt(id), dto);
    }

    @Post('relacionar-evaluacion')
    relacionarEvaluacion(@Body() dto: RelacionarEvaluacionDto) {
        return this.facade.relacionarEvaluacion(dto.nit_usuario, dto.nit_jefe);
    }

}
