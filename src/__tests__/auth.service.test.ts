import bcrypt from 'bcrypt';

// PASO 1 — mockear el módulo del repositorio ANTES de importar el servicio.
// Así auth.service.ts nunca toca Mongo; solo llama a funciones jest.fn().
jest.mock('../repositories/users.repository');

import * as usersRepo from '../repositories/users.repository';
import * as authService from '../services/auth.service';
import { signRefreshToken } from '../utils/jwt';
import type { IUser } from '../models/user.model';

const mockFindByEmail = usersRepo.findUserByEmail as jest.MockedFunction<
  typeof usersRepo.findUserByEmail
>;
const mockFindById = usersRepo.findUserById as jest.MockedFunction<typeof usersRepo.findUserById>;
const mockCreateUser = usersRepo.createUser as jest.MockedFunction<typeof usersRepo.createUser>;
const mockUpdateRefreshToken = usersRepo.updateRefreshToken as jest.MockedFunction<
  typeof usersRepo.updateRefreshToken
>;

// Helper: construye un objeto que "parece" un IUser de Mongoose lo suficiente
// para lo que auth.service.ts lee de él (_id, name, email, role, password).
function buildUser(overrides: Partial<IUser> = {}): IUser {
  return {
    _id: '507f1f77bcf86cd799439011',
    name: 'Alice',
    email: 'alice@test.com',
    password: 'hashed-password',
    role: 'user',
    ...overrides,
  } as IUser;
}

describe('auth.service', () => {
  describe('register', () => {
    it('should create the user when the email is not registered yet', async () => {
      // Arrange
      mockFindByEmail.mockResolvedValue(null);
      mockCreateUser.mockResolvedValue(buildUser());

      // Act
      const result = await authService.register({
        name: 'Alice',
        email: 'alice@test.com',
        password: 'Password1!',
      });

      // Assert
      expect(result).toMatchObject({ email: 'alice@test.com', role: 'user' });
      expect(mockFindByEmail).toHaveBeenCalledWith('alice@test.com');
      expect(mockCreateUser).toHaveBeenCalledTimes(1);
      // La contraseña nunca debe viajar en texto plano al repositorio
      const createArg = mockCreateUser.mock.calls[0]![0];
      expect(createArg.password).not.toBe('Password1!');
    });

    it('should throw AppError 409 when the email is already registered', async () => {
      mockFindByEmail.mockResolvedValue(buildUser());

      await expect(
        authService.register({ name: 'Alice', email: 'alice@test.com', password: 'Password1!' })
      ).rejects.toMatchObject({ statusCode: 409 });

      expect(mockCreateUser).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should throw AppError 401 when the user does not exist', async () => {
      mockFindByEmail.mockResolvedValue(null);

      await expect(
        authService.login({ email: 'nobody@test.com', password: 'Whatever1!' })
      ).rejects.toMatchObject({ statusCode: 401 });
    });

    it('should throw AppError 401 when the password does not match', async () => {
      const realHash = await bcrypt.hash('CorrectPass1!', 1); // rounds=1 → test rápido
      mockFindByEmail.mockResolvedValue(buildUser({ password: realHash }));

      await expect(
        authService.login({ email: 'alice@test.com', password: 'WrongPass1!' })
      ).rejects.toMatchObject({ statusCode: 401 });
    });

    it('should return tokens and role on valid credentials', async () => {
      const realHash = await bcrypt.hash('CorrectPass1!', 1);
      mockFindByEmail.mockResolvedValue(buildUser({ password: realHash }));
      mockUpdateRefreshToken.mockResolvedValue(undefined);

      const result = await authService.login({
        email: 'alice@test.com',
        password: 'CorrectPass1!',
      });

      expect(result.accessToken).toEqual(expect.any(String));
      expect(result.refreshToken).toEqual(expect.any(String));
      expect(result.role).toBe('user');
      expect(mockUpdateRefreshToken).toHaveBeenCalledTimes(1);
    });
  });

  describe('getMe', () => {
    it('should return the user data when found', async () => {
      mockFindById.mockResolvedValue(buildUser());

      const result = await authService.getMe('507f1f77bcf86cd799439011');

      expect(result).toMatchObject({ email: 'alice@test.com', role: 'user' });
    });

    it('should throw AppError 404 when the user does not exist', async () => {
      mockFindById.mockResolvedValue(null);

      await expect(authService.getMe('does-not-exist')).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe('refreshTokens', () => {
    it('should throw AppError 401 when the token is malformed or invalid', async () => {
      await expect(authService.refreshTokens('not-a-real-jwt')).rejects.toMatchObject({
        statusCode: 401,
      });
    });

    it('should throw AppError 401 when the token is valid but the user no longer exists', async () => {
      const token = signRefreshToken('507f1f77bcf86cd799439011');
      mockFindById.mockResolvedValue(null);

      await expect(authService.refreshTokens(token)).rejects.toMatchObject({ statusCode: 401 });
    });

    it('should return new tokens when the refresh token is valid', async () => {
      const token = signRefreshToken('507f1f77bcf86cd799439011');
      mockFindById.mockResolvedValue(buildUser());
      mockUpdateRefreshToken.mockResolvedValue(undefined);

      const result = await authService.refreshTokens(token);

      expect(result.accessToken).toEqual(expect.any(String));
      expect(result.refreshToken).toEqual(expect.any(String));
      expect(mockUpdateRefreshToken).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        result.refreshToken
      );
    });
  });

  describe('logout', () => {
    it('should clear the stored refresh token for the user', async () => {
      mockUpdateRefreshToken.mockResolvedValue(undefined);

      await authService.logout('507f1f77bcf86cd799439011');

      expect(mockUpdateRefreshToken).toHaveBeenCalledWith('507f1f77bcf86cd799439011', null);
    });
  });
});
