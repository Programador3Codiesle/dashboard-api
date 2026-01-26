import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            checkDatabaseConnection: jest
              .fn()
              .mockResolvedValue('Conexión a la base de datos exitosa!'),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('checkDb', () => {
    it('should return database connection status', async () => {
      const checkDbSpy = jest.spyOn(appService, 'checkDatabaseConnection');
      const result = await appController.checkDb();
      expect(result).toBe('Conexión a la base de datos exitosa!');
      expect(checkDbSpy).toHaveBeenCalled();
    });
  });
});
