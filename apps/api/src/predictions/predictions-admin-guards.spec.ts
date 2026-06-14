/**
 * Regression: Prediction admin route guard coverage.
 *
 * Finding claimed that admin routes (settle/lock/void fixture, lock/settle gameweek)
 * might bypass JWT authentication.
 *
 * Investigation result: FALSE_POSITIVE.
 * - @UseGuards(JwtAuthGuard) is applied at class level on PredictionsController.
 * - NestJS merges controller-level and method-level guards; it does NOT override.
 * - Admin methods add @UseGuards(RolesGuard) + @Roles('PSL_ADMIN') at method level.
 * - Both guards run: JwtAuthGuard first (401 if no token), then RolesGuard (403 if wrong role).
 *
 * These tests serve as regression coverage to catch any future accidental removal of guards.
 */
import 'reflect-metadata';
import { describe, it, expect } from 'vitest';
import { Reflector } from '@nestjs/core';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PredictionsController } from './predictions.controller';
import { ROLES_KEY } from '../auth/decorators/roles.decorator';
import type { LocalJwtProvider } from '../auth/providers/local-jwt.provider';

const reflector = new Reflector();

function getClassGuards(ctor: Function): Function[] {
  return (Reflect.getMetadata('__guards__', ctor) as Function[]) ?? [];
}

function getMethodGuards(proto: object, method: string): Function[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handler = (proto as any)[method] as object;
  return (Reflect.getMetadata('__guards__', handler) as Function[]) ?? [];
}

function getMethodRoles(proto: object, method: string): string[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handler = (proto as any)[method] as object;
  // Read roles from method first, then fall back to class
  const methodRoles = Reflect.getMetadata(ROLES_KEY, handler) as string[] | undefined;
  const classRoles = Reflect.getMetadata(ROLES_KEY, proto.constructor) as string[] | undefined;
  return methodRoles ?? classRoles ?? [];
}

describe('PredictionsController guard metadata', () => {
  const proto = PredictionsController.prototype;

  it('controller class has JwtAuthGuard applied', () => {
    const guards = getClassGuards(PredictionsController);
    const names = guards.map(g => (g as { name?: string }).name ?? String(g));
    expect(names).toContain('JwtAuthGuard');
  });

  const adminMethods = [
    'settleFixture',
    'lockFixture',
    'voidFixture',
    'lockGameweek',
    'lockGameweekForce',
    'settleGameweek',
  ];

  for (const method of adminMethods) {
    it(`${method} has RolesGuard at method level`, () => {
      const guards = getMethodGuards(proto, method);
      const names = guards.map(g => (g as { name?: string }).name ?? String(g));
      expect(names).toContain('RolesGuard');
    });

    it(`${method} requires PSL_ADMIN role`, () => {
      const roles = getMethodRoles(proto, method);
      expect(roles).toContain('PSL_ADMIN');
    });
  }
});

describe('JwtAuthGuard unauthenticated rejection', () => {
  it('rejects request with no Authorization header → 401', async () => {
    const mockProvider = {
      verifyToken: () => { throw new Error('invalid'); },
    } as unknown as LocalJwtProvider;
    const guard = new JwtAuthGuard(mockProvider);

    const ctx = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: {} }),
      }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('rejects invalid Bearer token → 401', async () => {
    const mockProvider = {
      verifyToken: () => { throw new Error('invalid'); },
    } as unknown as LocalJwtProvider;
    const guard = new JwtAuthGuard(mockProvider);

    const ctx = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: { authorization: 'Bearer bad-token' } }),
      }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });
});

describe('RolesGuard role enforcement', () => {
  it('throws ForbiddenException when user has FAN role but PSL_ADMIN required', () => {
    const guard = new RolesGuard(reflector);

    function adminHandler() { /* noop */ }
    Reflect.defineMetadata(ROLES_KEY, ['PSL_ADMIN'], adminHandler);

    const ctx = {
      getHandler: () => adminHandler,
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({
          user: { sub: 'fan-uid', email: 'fan@test.co.za', role: 'FAN' },
        }),
      }),
    };

    expect(() => guard.canActivate(ctx as unknown as ExecutionContext)).toThrow(ForbiddenException);
  });

  it('allows PSL_ADMIN role through', () => {
    const guard = new RolesGuard(reflector);

    function adminHandler() { /* noop */ }
    Reflect.defineMetadata(ROLES_KEY, ['PSL_ADMIN'], adminHandler);

    const ctx = {
      getHandler: () => adminHandler,
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({
          user: { sub: 'admin-uid', email: 'admin@test.co.za', role: 'PSL_ADMIN' },
        }),
      }),
    };

    expect(guard.canActivate(ctx as unknown as ExecutionContext)).toBe(true);
  });
});
