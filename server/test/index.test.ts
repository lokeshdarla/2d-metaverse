import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';

function sum(a, b) {
  return a + b;
}

describe('sum', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });
  it('should add two numbers correctly', () => {
    expect(sum(2, 3)).toBe(5);
    expect(sum(-2, 3)).toBe(1);
    expect(sum(0, 0)).toBe(0);
  });
});
