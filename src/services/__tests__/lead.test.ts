import { LeadService } from '../lead-service'

const service = new LeadService()

describe('LeadService', () => {
  it('classifica lead quente', async () => {
    const lead = await service.create({
      nome: 'Test',
      email: 'test@test.com',
      telefone: '11999999999',
      origem: 'site'
    })
    expect(lead.status).toBe('quente')
  })
})