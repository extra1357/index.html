const fs = require('fs');
let lines = fs.readFileSync('prisma/schema.prisma', 'utf8').split('\n');

// Encontra a linha do slug e adiciona corretorId depois
const slugIdx = lines.findIndex(l => l.includes('slug            String?      @unique'));
if (slugIdx !== -1) {
  lines.splice(slugIdx + 1, 0, '  corretorId      String?');
  lines.splice(slugIdx + 2, 0, '  corretor        Corretor?    @relation("ImovelCorretor", fields: [corretorId], references: [id])');
  console.log('Campo corretorId adicionado na linha', slugIdx + 1);
} else {
  console.log('ERRO: linha slug nao encontrada');
}

// Adiciona relacao inversa no Corretor
const corretorAlugueis = lines.findIndex(l => l.includes('alugueis       Aluguel[]'));
if (corretorAlugueis !== -1) {
  lines.splice(corretorAlugueis + 1, 0, '  imoveisCorretor Imovel[]   @relation("ImovelCorretor")');
  console.log('Relacao inversa adicionada no Corretor');
} else {
  console.log('ERRO: linha alugueis do Corretor nao encontrada');
}

fs.writeFileSync('prisma/schema.prisma', lines.join('\n'), 'utf8');
console.log('Pronto!');
