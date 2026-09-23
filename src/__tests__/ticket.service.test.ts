// Mockeamos el modelo Mongoose completo. ticket.service.ts solo conoce
// esta interfaz (find, findById, create, findByIdAndUpdate, findByIdAndDelete),
// nunca toca una base de datos real.
jest.mock('../models/ticket.model', () => ({
  Ticket: {
    find: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  },
}));

import { Ticket } from '../models/ticket.model';
import * as ticketService from '../services/ticket.service';

const mockFind = Ticket.find as jest.MockedFunction<typeof Ticket.find>;
const mockFindById = Ticket.findById as jest.MockedFunction<typeof Ticket.findById>;
const mockCreate = Ticket.create as unknown as jest.MockedFunction<typeof Ticket.create>;
const mockFindByIdAndUpdate = Ticket.findByIdAndUpdate as jest.MockedFunction<
  typeof Ticket.findByIdAndUpdate
>;
const mockFindByIdAndDelete = Ticket.findByIdAndDelete as jest.MockedFunction<
  typeof Ticket.findByIdAndDelete
>;

const baseTicket = {
  _id: 'ticket-1',
  code: 'TKT-1001',
  title: 'Impresora no funciona',
  description: 'La impresora del piso 3 no responde',
  status: 'open',
  priority: 'medium',
  estimatedHours: 2,
  active: true,
  createdBy: 'user-1',
};

describe('ticket.service', () => {
  describe('findAll', () => {
    it('should return only active tickets, newest first', async () => {
      const sortMock = jest.fn().mockResolvedValue([baseTicket]);
      mockFind.mockReturnValue({ sort: sortMock } as never);

      const result = await ticketService.findAll();

      expect(mockFind).toHaveBeenCalledWith({ active: true });
      expect(sortMock).toHaveBeenCalledWith({ createdAt: -1 });
      expect(result).toEqual([baseTicket]);
    });
  });

  describe('findById', () => {
    it('should return the ticket when it exists', async () => {
      mockFindById.mockResolvedValue(baseTicket as never);

      const result = await ticketService.findById('ticket-1');

      expect(result).toEqual(baseTicket);
    });

    it('should return null when the ticket does not exist', async () => {
      mockFindById.mockResolvedValue(null);

      const result = await ticketService.findById('does-not-exist');

      expect(result).toBeNull();
    });

    it('should throw AppError 400 when the id is not a valid ObjectId (CastError)', async () => {
      const castError = new Error('Cast to ObjectId failed');
      castError.name = 'CastError';
      mockFindById.mockRejectedValue(castError);

      await expect(ticketService.findById('not-a-valid-id')).rejects.toMatchObject({
        statusCode: 400,
      });
    });

    it('should rethrow unexpected errors untouched (not a CastError)', async () => {
      const dbError = new Error('connection lost');
      mockFindById.mockRejectedValue(dbError);

      await expect(ticketService.findById('ticket-1')).rejects.toThrow('connection lost');
    });
  });

  describe('create', () => {
    const dto = {
      code: 'TKT-1002',
      title: 'Sin acceso a correo',
      description: 'El usuario no puede iniciar sesión en el correo corporativo',
      estimatedHours: 1,
    };

    it('should create a ticket tagged with the creator id', async () => {
      mockCreate.mockResolvedValue({ ...baseTicket, ...dto } as never);

      const result = await ticketService.create(dto as never, 'user-1');

      expect(mockCreate).toHaveBeenCalledWith({ ...dto, createdBy: 'user-1' });
      expect(result).toMatchObject({ code: 'TKT-1002' });
    });

    it('should throw AppError 409 when the ticket code already exists (duplicate key)', async () => {
      const duplicateKeyError = { code: 11000 };
      mockCreate.mockRejectedValue(duplicateKeyError as never);

      await expect(ticketService.create(dto as never, 'user-1')).rejects.toMatchObject({
        statusCode: 409,
      });
    });

    it('should rethrow unexpected errors untouched (not a duplicate-key error)', async () => {
      const dbError = new Error('connection lost');
      mockCreate.mockRejectedValue(dbError as never);

      await expect(ticketService.create(dto as never, 'user-1')).rejects.toThrow('connection lost');
    });
  });

  describe('update', () => {
    it('should update the ticket when the requester is its owner', async () => {
      mockFindById.mockResolvedValue({ ...baseTicket, createdBy: 'user-1' } as never);
      mockFindByIdAndUpdate.mockResolvedValue({ ...baseTicket, status: 'closed' } as never);

      const result = await ticketService.update(
        'ticket-1',
        { status: 'closed' } as never,
        'user-1',
        'user'
      );

      expect(result).toMatchObject({ status: 'closed' });
    });

    it('should update the ticket when the requester is admin, regardless of ownership', async () => {
      mockFindById.mockResolvedValue({ ...baseTicket, createdBy: 'someone-else' } as never);
      mockFindByIdAndUpdate.mockResolvedValue({ ...baseTicket, status: 'closed' } as never);

      const result = await ticketService.update(
        'ticket-1',
        { status: 'closed' } as never,
        'admin-1',
        'admin'
      );

      expect(result).toMatchObject({ status: 'closed' });
    });

    it('should throw FORBIDDEN when a non-owner, non-admin tries to update the ticket', async () => {
      mockFindById.mockResolvedValue({ ...baseTicket, createdBy: 'someone-else' } as never);

      await expect(
        ticketService.update('ticket-1', { status: 'closed' } as never, 'user-1', 'user')
      ).rejects.toThrow('FORBIDDEN');

      expect(mockFindByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('should return null when the ticket does not exist', async () => {
      mockFindById.mockResolvedValue(null);

      const result = await ticketService.update(
        'does-not-exist',
        { status: 'closed' } as never,
        'user-1',
        'user'
      );

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('should delete and return the ticket when it exists', async () => {
      mockFindByIdAndDelete.mockResolvedValue(baseTicket as never);

      const result = await ticketService.remove('ticket-1');

      expect(mockFindByIdAndDelete).toHaveBeenCalledWith('ticket-1');
      expect(result).toEqual(baseTicket);
    });

    it('should return null when the ticket does not exist', async () => {
      mockFindByIdAndDelete.mockResolvedValue(null);

      const result = await ticketService.remove('does-not-exist');

      expect(result).toBeNull();
    });
  });
});
