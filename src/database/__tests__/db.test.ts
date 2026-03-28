import dbService from '../db-service'

describe('Database', () => {
  it('conecta ao DB', async () => {
    const ok = await dbService.checkConnection()
    expect(ok).toBe(true)
  })

  afterAll(async () => {
    await dbService.disconnect()
  })
})