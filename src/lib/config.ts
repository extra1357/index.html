// Configurações centralizadas da imobiliária
// Altere esses valores conforme necessário

export const CONFIG = {
  // Nome da imobiliária (será usado em todo o site)
  nome: 'Imobiliária Perto',

  // WhatsApp para contato (com código do país + DDD + número, sem traços)
  whatsapp: '5511976661297',

  // URL do site (para SEO e links)
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.imobiliariaperto.com.br',

  // Redes sociais (deixe vazio se não tiver)
  redesSociais: {
    facebook: '',
    instagram: '',
    linkedin: '',
    youtube: '',
  },

  // Endereço físico
  endereco: {
    rua: 'Estado do Maranhão',
    numero: '289',
    bairro: 'Terras de São Pedro e São Paulo',
    cidade: 'Salto',
    estado: 'São Paulo',
    cep: '13422132',
  },

  // Telefone fixo (opcional)
  telefone: '11976661297',

  // E-mail de contato
  email: 'contato@imobiliariaperto.com.br',

  // CRECI da imobiliária
  creci: '256780',

  // Horário de funcionamento
  horario: 'Segunda a Sexta: 9h às 18h | Sábado: 9h às 13h',
}
