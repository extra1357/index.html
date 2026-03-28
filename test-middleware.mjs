import { createServer } from 'http';

const BASE_URL = 'http://localhost:3000';

const tests = [
  // Deve liberar (público)
  { path: '/',                    expectStatus: 200, desc: '✅ Home pública' },
  { path: '/admin/login',         expectStatus: 200, desc: '✅ Login público' },
  { path: '/imoveis',             expectStatus: 200, desc: '✅ Imóveis público' },
  { path: '/imoveis/qualquer-id', expectStatus: 200, desc: '✅ Imóvel detalhe público' },
  { path: '/api/imoveis',         expectStatus: 200, desc: '✅ API imóveis pública' },
  { path: '/api/leads',           expectStatus: 401, desc: '🔒 API leads bloqueada sem token' },

  // Deve bloquear (admin sem token)
  { path: '/admin',               expectStatus: 307, desc: '🔒 /admin redireciona para login' },
  { path: '/admin/dashboard',     expectStatus: 307, desc: '🔒 /admin/dashboard redireciona' },
  { path: '/admin/imoveis',       expectStatus: 307, desc: '🔒 /admin/imoveis redireciona' },
  { path: '/admin/leads',         expectStatus: 307, desc: '🔒 /admin/leads redireciona' },
  { path: '/admin/corretores',    expectStatus: 307, desc: '🔒 /admin/corretores redireciona' },
  { path: '/admin/usuarios',      expectStatus: 307, desc: '🔒 /admin/usuarios redireciona' },
  { path: '/api/vendas',          expectStatus: 401, desc: '🔒 /api/vendas bloqueada sem token' },
  { path: '/api/corretores',      expectStatus: 401, desc: '🔒 /api/corretores bloqueada' },
];

let passed = 0;
let failed = 0;

async function runTests() {
  console.log('\n🧪 Testando middleware de segurança...\n');
  console.log(`🌐 Servidor: ${BASE_URL}\n`);
  console.log('─'.repeat(60));

  for (const test of tests) {
    try {
      const res = await fetch(`${BASE_URL}${test.path}`, {
        redirect: 'manual', // não segue redirects
        headers: { 'Accept': 'text/html' }
      });

      const ok = res.status === test.expectStatus;
      if (ok) {
        console.log(`PASSOU  ${test.desc}`);
        console.log(`        ${test.path} → HTTP ${res.status}`);
        passed++;
      } else {
        console.log(`FALHOU  ${test.desc}`);
        console.log(`        ${test.path} → esperado ${test.expectStatus}, recebeu ${res.status}`);
        failed++;
      }
    } catch (err) {
      console.log(`ERRO    ${test.desc}`);
      console.log(`        ${test.path} → ${err.message}`);
      failed++;
    }
    console.log('─'.repeat(60));
  }

  console.log(`\n📊 Resultado: ${passed} passaram / ${failed} falharam\n`);

  if (failed === 0) {
    console.log('🎉 Middleware funcionando corretamente!\n');
  } else {
    console.log('⚠️  Alguns testes falharam — middleware pode não estar ativo.\n');
    console.log('💡 Verifique:');
    console.log('   1. O arquivo se chama exatamente "middleware.ts" (sem espaços)');
    console.log('   2. Está na raiz do projeto (não dentro de /src)');
    console.log('   3. O servidor foi reiniciado após a correção\n');
  }
}

runTests();
