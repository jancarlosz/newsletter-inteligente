import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'JWT_SECRET') return 'test_secret';
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('deve estar definido', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('deve extrair e retornar o userId e o email do payload do token', async () => {
      const payload = { sub: 'user_123', email: 'test@singulari.com' };
      
      const result = await strategy.validate(payload);
      
      expect(result).toEqual({ userId: 'user_123', email: 'test@singulari.com' });
    });
  });
});
