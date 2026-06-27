import 'reflect-metadata';
import { describe, it, expect, vi } from 'vitest';
import { AuthController } from './auth.controller';
import type { AuthService } from './auth.service';

function makeController() {
  const register = vi.fn();
  const authService = {
    register,
    login: vi.fn(),
    logout: vi.fn(),
    me: vi.fn(),
    requestPasswordReset: vi.fn(),
    confirmPasswordReset: vi.fn(),
    changePassword: vi.fn(),
    confirmEmailVerification: vi.fn(),
    requestEmailVerification: vi.fn(),
  } as unknown as AuthService;

  return { controller: new AuthController(authService), register };
}

describe('AuthController.register', () => {
  it('passes emailDeliveryStatus through on enumerable register responses', async () => {
    const { controller, register } = makeController();
    register.mockResolvedValue({
      enumerable: true,
      accessToken: 'token-1',
      user: { id: 'u1', email: 'fan@pslone.co.za', role: 'FAN', emailVerified: false },
      emailDeliveryStatus: 'FAILED',
    } as never);

    const result = await controller.register(
      {
        email: 'fan@pslone.co.za',
        password: 'Password123!',
        dateOfBirth: '2000-01-01',
        consentCoreService: true,
      } as never,
      'test-agent',
    );

    expect(result).toEqual({
      accessToken: 'token-1',
      user: { id: 'u1', email: 'fan@pslone.co.za', role: 'FAN', emailVerified: false },
      emailDeliveryStatus: 'FAILED',
    });
  });

  it('returns the inbox message when register is non-enumerable', async () => {
    const { controller, register } = makeController();
    register.mockResolvedValue({ enumerable: false } as never);

    const result = await controller.register(
      {
        email: 'fan@pslone.co.za',
        password: 'Password123!',
        dateOfBirth: '2000-01-01',
        consentCoreService: true,
      } as never,
      'test-agent',
    );

    expect(result).toEqual({
      message: 'Registration processed. Please check your inbox to confirm your account.',
    });
  });
});
