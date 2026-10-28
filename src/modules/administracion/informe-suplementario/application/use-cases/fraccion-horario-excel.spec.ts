import {
  fraccionarHorarioExcel,
  horaMilitarExcel,
} from './fraccion-horario-excel';

describe('horaMilitarExcel', () => {
  it('pasa las 3 PM a 15:00', () => {
    expect(horaMilitarExcel('3:00 PM')).toBe('15:00');
    expect(horaMilitarExcel('3:00PM')).toBe('15:00');
    expect(horaMilitarExcel('3:00 p. m.')).toBe('15:00');
  });

  it('recorta segundos y deja 24 h', () => {
    expect(horaMilitarExcel('15:00:00.0000000')).toBe('15:00');
    expect(horaMilitarExcel('5:00')).toBe('05:00');
  });
});

describe('fraccionarHorarioExcel', () => {
  it('parte 17:00 a 21:00 en diurna hasta 18:59 y nocturna desde 19:00', () => {
    expect(fraccionarHorarioExcel('17:00', '21:00')).toEqual({
      horaInicio: '17:00',
      horaSalida: '18:59',
      horaInicioNocturna: '19:00',
      horaSalidaNocturna: '21:00',
    });
  });

  it('deja vacía la nocturna si el turno termina antes de las 19:00', () => {
    expect(fraccionarHorarioExcel('08:00', '17:00')).toEqual({
      horaInicio: '08:00',
      horaSalida: '17:00',
      horaInicioNocturna: '',
      horaSalidaNocturna: '',
    });
  });

  it('deja vacía la diurna si todo el turno es nocturno', () => {
    expect(fraccionarHorarioExcel('20:00', '23:00')).toEqual({
      horaInicio: '',
      horaSalida: '',
      horaInicioNocturna: '20:00',
      horaSalidaNocturna: '23:00',
    });
  });

  it('cierra la madrugada en 05:59 y retoma el día a las 06:00', () => {
    expect(fraccionarHorarioExcel('05:00', '08:00')).toEqual({
      horaInicio: '06:00',
      horaSalida: '08:00',
      horaInicioNocturna: '05:00',
      horaSalidaNocturna: '05:59',
    });
  });

  it('si sale a las 06:00 la nocturna conserva esa hora', () => {
    expect(fraccionarHorarioExcel('22:00', '06:00')).toEqual({
      horaInicio: '',
      horaSalida: '',
      horaInicioNocturna: '22:00',
      horaSalidaNocturna: '06:00',
    });
  });

  it('convierte 3:00 PM a 5:00 PM sin inventar recargo', () => {
    expect(fraccionarHorarioExcel('3:00 PM', '5:00 PM')).toEqual({
      horaInicio: '15:00',
      horaSalida: '17:00',
      horaInicioNocturna: '',
      horaSalidaNocturna: '',
    });
  });
});
