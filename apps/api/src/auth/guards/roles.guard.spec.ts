import 'reflect-metadata';
import { describe, it, expect, vi } from 'vitest';
import { ForbiddenException, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

function makeContext(role: string | undefined, handlerRoles?: string[], classRoles?: string[]): ExecutionContext {
  const reflector = new Reflector();
  vi.spyOn(reflector, 'getAllAndOverride').mockImplementation((_key, _targets) => {
    return (handlerRoles ?? classRoles) as unknown as string[];
  });
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({ user: role ? { role } : undefined }),
    }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  it('allows request when no roles required', () => {
    const reflector = { getAllAndOverride: vi.fn().mockReturnValue(undefined) } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    const ctx = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({ getRequest: () => ({ user: { role: 'FAN' } }) }),
    } as unknown as ExecutionContext;
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('allows PSL_ADMIN on admin-only route', () => {
    const reflector = { getAllAndOverride: vi.fn().mockReturnValue(['PSL_ADMIN']) } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    const ctx = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({ getRequest: () => ({ user: { role: 'PSL_ADMIN', sub: 'u1' } }) }),
    } as unknown as ExecutionContext;
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('throws ForbiddenException for FAN on admin route', () => {
    const reflector = { getAllAndOverride: vi.fn().mockReturnValue(['PSL_ADMIN']) } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    const ctx = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({ getRequest: () => ({ user: { role: 'FAN', sub: 'u2' } }) }),
    } as unknown as ExecutionContext;
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('throws ForbiddenException when user is absent', () => {
    const reflector = { getAllAndOverride: vi.fn().mockReturnValue(['PSL_ADMIN']) } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    const ctx = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({ getRequest: () => ({}) }),
    } as unknown as ExecutionContext;
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('reads both handler and class-level roles (getAllAndOverride)', () => {
    const reflector = { getAllAndOverride: vi.fn().mockReturnValue(['PSL_ADMIN']) } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    const handler = {};
    const cls = {};
    const ctx = {
      getHandler: () => handler,
      getClass: () => cls,
      switchToHttp: () => ({ getRequest: () => ({ user: { role: 'FAN' } }) }),
    } as unknown as ExecutionContext;
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
      expect.anything(),
      [handler, cls],
    );
  });
});
