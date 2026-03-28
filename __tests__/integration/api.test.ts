export const dynamic = 'force-dynamic';

describe('API Integration', () => {
  const baseUrl = 'http://localhost:3000/api'

  it('POST /leads cria lead', async () => {
    const res = await fetch(`${baseUrl}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: 'Test User',
        email: 'test@test.com',
        telefone: '11999999999',
        origem: 'site'
      })
    })
    const data = await res.json()
    expect(data.success).toBe(true)
  })

  it('GET /leads retorna lista', async () => {
    const res = await fetch(`${baseUrl}/leads`)
    const data = await res.json()
    expect(Array.isArray(data.data)).toBe(true)
  })
})