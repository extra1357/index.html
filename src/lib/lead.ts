export async function capturarLead(data: {
  origem: string;
  cidade: string;
  pagina: string;
}) {
  try {
    await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        userAgent: navigator.userAgent,
        createdAt: new Date(),
      }),
    });
  } catch (error) {
    console.error('Erro ao capturar lead', error);
  }
}
