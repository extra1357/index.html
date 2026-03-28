const fs = require('fs');
let lines = fs.readFileSync('prisma/schema.prisma', 'utf8').split('\n');

// Remove duplicata de imoveisCorretor
let found = false;
lines = lines.filter(l => {
  if (l.includes('imoveisCorretor Imovel[]')) {
    if (!found) { found = true; return true; }
    return false;
  }
  return true;
});

fs.writeFileSync('prisma/schema.prisma', lines.join('\n'), 'utf8');
console.log('Duplicata removida!');
