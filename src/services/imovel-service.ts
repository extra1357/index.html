import { BaseService } from './base-service'
import { z } from 'zod'
import { generateSlug, generateCodigo } from '@/lib/generateSlug'

const imovelSchema = z.object({
  tipo: z.string(),
  endereco: z.string(),
  cidade: z.string(),
  estado: z.string(),
  preco: z.number(),
  metragem: z.number(),
  proprietarioId: z.string(),
  quartos: z.number().optional(),
  bairro: z.string().optional(),
})

export class ImovelService extends BaseService {
  async create(data: z.infer<typeof imovelSchema>) {
    // ✅ GERAR CÓDIGO E SLUG AUTOMATICAMENTE
    const codigo = generateCodigo(data.tipo);
    const slug = generateSlug({
      tipo: data.tipo,
      cidade: data.cidade,
      bairro: data.bairro || data.endereco?.split(',')[1]?.trim() || '',
      quartos: data.quartos || 0,
      codigo
    });

    return await this.db.imovel.create({ 
      data: {
        ...data,
        codigo,
        slug
      }
    })
  }

  async list(filtros?: { cidade?: string; disponivel?: boolean }) {
    return await this.db.imovel.findMany({ 
      where: filtros,
      include: { proprietario: true }
    })
  }

  async update(id: string, data: Partial<z.infer<typeof imovelSchema>>) {
    return await this.db.imovel.update({ where: { id }, data })
  }

  async delete(id: string) {
    return await this.db.imovel.delete({ where: { id } })
  }
}

export default new ImovelService()
