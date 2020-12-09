import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where
} from '@loopback/repository';
import {
  del, get,
  getModelSchemaRef, param,


  patch, post,




  put,

  requestBody
} from '@loopback/rest';
import { Booking } from '../models';
import { BookingRepository } from '../repositories';

export const BookingsUrl = '/bookings';

export class BookingController {
  constructor(
    @repository(BookingRepository)
    public bookingRepository: BookingRepository,
  ) { }

  @post(BookingsUrl, {
    responses: {
      '200': {
        description: 'Booking model instance',
        content: { 'application/json': { schema: getModelSchemaRef(Booking) } },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Booking, {
            title: 'NewBooking',
            exclude: ['id'],
          }),
        },
      },
    })
    booking: Omit<Booking, 'id'>,
  ): Promise<Booking> {
    return this.bookingRepository.create(booking);
  }

  @get(BookingsUrl + '/count', {
    responses: {
      '200': {
        description: 'Booking model count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async count(
    @param.where(Booking) where?: Where<Booking>,
  ): Promise<Count> {
    return this.bookingRepository.count(where);
  }

  @get(BookingsUrl, {
    responses: {
      '200': {
        description: 'Array of Booking model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Booking, { includeRelations: true }),
            },
          },
        },
      },
    },
  })
  async find(
    @param.filter(Booking) filter?: Filter<Booking>,
  ): Promise<Booking[]> {
    return this.bookingRepository.find(filter);
  }

  @patch(BookingsUrl, {
    responses: {
      '200': {
        description: 'Booking PATCH success count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Booking, { partial: true }),
        },
      },
    })
    booking: Booking,
    @param.where(Booking) where?: Where<Booking>,
  ): Promise<Count> {
    return this.bookingRepository.updateAll(booking, where);
  }

  @get(BookingsUrl + '/{id}', {
    responses: {
      '200': {
        description: 'Booking model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Booking, { includeRelations: true }),
          },
        },
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Booking, { exclude: 'where' }) filter?: FilterExcludingWhere<Booking>
  ): Promise<Booking> {
    return this.bookingRepository.findById(id, filter);
  }

  @patch(BookingsUrl + '/{id}', {
    responses: {
      '204': {
        description: 'Booking PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Booking, { partial: true }),
        },
      },
    })
    booking: Booking,
  ): Promise<void> {
    await this.bookingRepository.updateById(id, booking);
  }

  @put(BookingsUrl + '/{id}', {
    responses: {
      '204': {
        description: 'Booking PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() booking: Booking,
  ): Promise<void> {
    await this.bookingRepository.replaceById(id, booking);
  }

  @del(BookingsUrl + '/{id}', {
    responses: {
      '204': {
        description: 'Booking DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.bookingRepository.deleteById(id);
  }
}
