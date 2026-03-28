export const dynamic = 'force-dynamic';

export const apiService = {
  async get(url: string) {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Erro ${response.status}`);
    }
    return response.json();
  },

  async post(url: string, data: any) {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      // ✅ AQUI ESTAVA O ERRO: Precisamos converter o objeto para string JSON
      body: JSON.stringify(data),
      cache: 'no-store',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Erro ${response.status}`);
    }
    return response.json();
  }
};
