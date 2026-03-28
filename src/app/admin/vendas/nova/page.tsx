'use client';

export const dynamic = 'force-dynamic';


import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NovaVendaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imoveis, setImoveis] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [corretores, setCorretores] = useState<any[]>([]);
  const [imovelSelecionado, setImovelSelecionado] = useState<any>(null);
  const [error, setError] = useState('');
  const [contratoGerado, setContratoGerado] = useState(false);

  const [form, setForm] = useState({
    imovelId: '',
    compradorId: '',
    corretorId: '',
    // Dados do comprador
    compradorNome: '',
    compradorCpf: '',
    compradorRg: '',
    compradorNacionalidade: 'brasileiro(a)',
    compradorEstadoCivil: 'solteiro(a)',
    compradorProfissao: '',
    compradorEndereco: '',
    compradorEmail: '',
    compradorTelefone: '',
    // Cônjuge (se casado)
    conjugeNome: '',
    conjugeCpf: '',
    conjugeRg: '',
    // Valores
    valorVenda: '',
    valorEntrada: '',
    valorFinanciado: '',
    // Forma de pagamento
    formaPagamento: 'avista',
    bancoFinanciamento: '',
    parcelas: '',
    // Comissão
    percentualComissao: '6',
    // Datas
    dataAssinatura: '',
    dataEscritura: '',
    // Cláusulas
    clausulasAdicionais: '',
  });

  useEffect(() => {
    fetch('/api/imoveis').then(r => r.json()).then(d => setImoveis(Array.isArray(d) ? d : [])).catch(console.error);
    fetch('/api/leads').then(r => r.json()).then(d => setLeads(Array.isArray(d) ? d : [])).catch(console.error);
    fetch('/api/corretores').then(r => r.json()).then(d => setCorretores(Array.isArray(d) ? d : [])).catch(console.error);
  }, []);

  const handleImovelChange = (id: string) => {
    const imovel = imoveis.find(i => i.id === id);
    setImovelSelecionado(imovel || null);
    setForm(prev => ({ 
      ...prev, 
      imovelId: id,
      valorVenda: imovel?.preco ? String(imovel.preco) : ''
    }));
  };

  const handleCompradorChange = (id: string) => {
    const lead = leads.find(l => l.id === id);
    if (lead) {
      setForm(prev => ({
        ...prev,
        compradorId: id,
        compradorNome: lead.nome,
        compradorEmail: lead.email,
        compradorTelefone: lead.telefone,
      }));
    }
  };

  const formatarMoeda = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const valorPorExtenso = (valor: number): string => {
    if (valor === 0) return 'zero reais';
    
    const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
    const especiais = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
    const dezenas = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
    const centenas = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

    const converterGrupo = (n: number): string => {
      if (n === 0) return '';
      if (n === 100) return 'cem';
      
      let resultado = '';
      const c = Math.floor(n / 100);
      const d = Math.floor((n % 100) / 10);
      const u = n % 10;

      if (c > 0) resultado += centenas[c];
      
      if (n % 100 >= 10 && n % 100 <= 19) {
        if (resultado) resultado += ' e ';
        resultado += especiais[n % 100 - 10];
      } else {
        if (d > 0) {
          if (resultado) resultado += ' e ';
          resultado += dezenas[d];
        }
        if (u > 0) {
          if (resultado) resultado += ' e ';
          resultado += unidades[u];
        }
      }
      return resultado;
    };

    const inteiro = Math.floor(valor);
    let resultado = '';

    if (inteiro >= 1000000) {
      const milhoes = Math.floor(inteiro / 1000000);
      resultado += milhoes === 1 ? 'um milhão' : converterGrupo(milhoes) + ' milhões';
    }

    const restoMilhao = inteiro % 1000000;
    if (restoMilhao >= 1000) {
      const milhares = Math.floor(restoMilhao / 1000);
      if (resultado) resultado += ' ';
      resultado += milhares === 1 ? 'mil' : converterGrupo(milhares) + ' mil';
    }

    const resto = restoMilhao % 1000;
    if (resto > 0) {
      if (resultado) resultado += ' e ';
      resultado += converterGrupo(resto);
    }

    resultado += inteiro === 1 ? ' real' : ' reais';
    return resultado;
  };

  const calcularComissao = () => {
    const valor = parseFloat(form.valorVenda) || 0;
    const percentual = parseFloat(form.percentualComissao) || 6;
    return valor * (percentual / 100);
  };

  const handleGerarContrato = () => {
    if (!form.imovelId || !form.compradorNome || !form.valorVenda) {
      setError('Preencha: Imóvel, Nome do Comprador e Valor da Venda');
      return;
    }
    setError('');
    const html = gerarHTML();
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    window.open(URL.createObjectURL(blob), '_blank');
    setContratoGerado(true);
  };

  const handleSalvarVenda = async () => {
    if (!form.imovelId || !form.compradorNome || !form.corretorId || !form.valorVenda) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let compradorId = form.compradorId;
      
      if (!compradorId) {
        const leadRes = await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nome: form.compradorNome,
            email: form.compradorEmail,
            telefone: form.compradorTelefone,
            origem: 'contrato_venda',
            status: 'fechado'
          })
        });
        const leadData = await leadRes.json();
        compradorId = leadData.id;
      }

      const response = await fetch('/api/vendas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imovelId: form.imovelId,
          leadId: compradorId,
          corretorId: form.corretorId,
          valorVenda: parseFloat(form.valorVenda),
          valorEntrada: form.valorEntrada ? parseFloat(form.valorEntrada) : null,
          valorFinanciado: form.valorFinanciado ? parseFloat(form.valorFinanciado) : null,
          percentualComissao: parseFloat(form.percentualComissao),
          formaPagamento: form.formaPagamento,
          bancoFinanciamento: form.bancoFinanciamento || null,
          observacoes: form.clausulasAdicionais
        })
      });

      if (!response.ok) throw new Error('Erro ao salvar venda');
      router.push('/admin/vendas');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const gerarHTML = () => {
    const valorVenda = parseFloat(form.valorVenda) || 0;
    const valorEntrada = parseFloat(form.valorEntrada) || 0;
    const valorFinanciado = parseFloat(form.valorFinanciado) || 0;
    const comissao = calcularComissao();
    const dataHoje = new Date().toLocaleDateString('pt-BR');
    const dataAssinatura = form.dataAssinatura ? new Date(form.dataAssinatura + 'T00:00:00').toLocaleDateString('pt-BR') : dataHoje;

    const formaPagamentoTexto: Record<string, string> = {
      'avista': 'à vista, mediante transferência bancária ou cheque administrativo',
      'financiamento': `mediante financiamento bancário junto ao ${form.bancoFinanciamento || '________________'}, com entrada de ${formatarMoeda(valorEntrada)} e saldo de ${formatarMoeda(valorFinanciado)} a ser financiado`,
      'parcelado': `de forma parcelada, sendo ${formatarMoeda(valorEntrada)} de entrada e o saldo em ${form.parcelas || '___'} parcelas`,
    };

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contrato de Compra e Venda - ${imovelSelecionado?.endereco || ''}</title>
  <style>
    @media print { body { margin: 0; padding: 20mm; } .no-print { display: none !important; } }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.8; color: #000; background: #fff; padding: 40px; max-width: 210mm; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 40px; border-bottom: 3px double #000; padding-bottom: 20px; }
    .header h1 { font-size: 16pt; font-weight: bold; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 2px; }
    .header h2 { font-size: 14pt; font-weight: normal; margin-bottom: 5px; }
    .header p { font-size: 10pt; color: #333; }
    .section { margin-bottom: 25px; }
    .section-title { font-weight: bold; font-size: 12pt; margin-bottom: 15px; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 5px; }
    .clause { margin-bottom: 20px; text-align: justify; }
    .clause-title { font-weight: bold; }
    .party { margin-bottom: 20px; padding: 15px; background: #f9f9f9; border-left: 3px solid #333; }
    .party-title { font-weight: bold; font-size: 11pt; margin-bottom: 10px; text-transform: uppercase; }
    .signatures { margin-top: 80px; page-break-inside: avoid; }
    .signature-line { display: flex; justify-content: space-between; margin-top: 80px; }
    .signature-box { width: 45%; text-align: center; }
    .signature-box .line { border-top: 1px solid #000; margin-bottom: 5px; padding-top: 5px; }
    .signature-box .name { font-weight: bold; font-size: 11pt; }
    .signature-box .doc { font-size: 10pt; color: #333; }
    .highlight { font-weight: bold; }
    .footer { margin-top: 40px; text-align: center; font-size: 10pt; color: #666; border-top: 1px solid #ccc; padding-top: 20px; }
    .btn-print { position: fixed; top: 20px; right: 20px; background: #16a34a; color: white; padding: 15px 30px; border: none; border-radius: 8px; font-size: 14pt; cursor: pointer; box-shadow: 0 4px 15px rgba(0,0,0,0.2); z-index: 1000; }
    .btn-print:hover { background: #15803d; }
    .imovel-info { background: #f0f9ff; border: 1px solid #0284c7; padding: 15px; margin: 20px 0; border-radius: 5px; }
    .valor-box { background: #f0fdf4; border: 2px solid #16a34a; padding: 20px; margin: 20px 0; text-align: center; }
    .valor-box .valor { font-size: 24pt; font-weight: bold; color: #16a34a; }
    .valor-box .extenso { font-size: 10pt; color: #333; margin-top: 5px; }
  </style>
</head>
<body>
  <button class="btn-print no-print" onclick="window.print()">🖨️ Imprimir / Salvar PDF</button>

  <div class="header">
    <h1>Instrumento Particular de</h1>
    <h1>Compromisso de Compra e Venda de Imóvel</h1>
    <p>Artigos 481 e seguintes do Código Civil Brasileiro</p>
  </div>

  <div class="section">
    <div class="section-title">Das Partes</div>
    
    <div class="party">
      <div class="party-title">PROMITENTE VENDEDOR(A)</div>
      <p><strong>Nome:</strong> ${imovelSelecionado?.proprietario?.nome || '_________________________________'}</p>
      <p><strong>CPF/CNPJ:</strong> ${imovelSelecionado?.proprietario?.cpfCnpj || '_________________________________'}</p>
      <p><strong>Endereço:</strong> ${imovelSelecionado?.proprietario?.endereco || '_________________________________'}</p>
      <p><strong>Telefone:</strong> ${imovelSelecionado?.proprietario?.telefone || '_________________________________'}</p>
      <p><strong>E-mail:</strong> ${imovelSelecionado?.proprietario?.email || '_________________________________'}</p>
    </div>

    <div class="party">
      <div class="party-title">PROMITENTE COMPRADOR(A)</div>
      <p><strong>Nome:</strong> ${form.compradorNome || '_________________________________'}</p>
      <p><strong>CPF:</strong> ${form.compradorCpf || '_________________________________'}</p>
      <p><strong>RG:</strong> ${form.compradorRg || '_________________________________'}</p>
      <p><strong>Nacionalidade:</strong> ${form.compradorNacionalidade}</p>
      <p><strong>Estado Civil:</strong> ${form.compradorEstadoCivil}</p>
      <p><strong>Profissão:</strong> ${form.compradorProfissao || '_________________________________'}</p>
      <p><strong>Endereço:</strong> ${form.compradorEndereco || '_________________________________'}</p>
      <p><strong>Telefone:</strong> ${form.compradorTelefone || '_________________________________'}</p>
      <p><strong>E-mail:</strong> ${form.compradorEmail || '_________________________________'}</p>
      ${form.compradorEstadoCivil === 'casado(a)' ? `
      <div style="margin-top: 15px; padding-top: 15px; border-top: 1px dashed #ccc;">
        <p><strong>CÔNJUGE:</strong></p>
        <p><strong>Nome:</strong> ${form.conjugeNome || '_________________________________'}</p>
        <p><strong>CPF:</strong> ${form.conjugeCpf || '_________________________________'}</p>
        <p><strong>RG:</strong> ${form.conjugeRg || '_________________________________'}</p>
      </div>
      ` : ''}
    </div>
  </div>

  <div class="section">
    <div class="section-title">Do Objeto</div>
    <div class="clause">
      <p><span class="clause-title">CLÁUSULA 1ª -</span> O presente instrumento tem como objeto a compra e venda do imóvel abaixo descrito e caracterizado:</p>
    </div>
    
    <div class="imovel-info">
      <p><strong>Tipo:</strong> ${imovelSelecionado?.tipo || '_________________________________'}</p>
      <p><strong>Endereço:</strong> ${imovelSelecionado?.endereco || '_________________________________'}</p>
      <p><strong>Cidade/UF:</strong> ${imovelSelecionado?.cidade || '_________'}/${imovelSelecionado?.estado || '__'}</p>
      <p><strong>Área:</strong> ${imovelSelecionado?.metragem || '___'} m²</p>
      <p><strong>Matrícula:</strong> _________________ do Cartório de Registro de Imóveis de ${imovelSelecionado?.cidade || '_________'}</p>
    </div>

    <div class="clause">
      <p><span class="clause-title">PARÁGRAFO ÚNICO -</span> O PROMITENTE VENDEDOR declara que o imóvel objeto deste contrato encontra-se livre e desembaraçado de quaisquer ônus, dívidas, impostos, taxas, contribuições, hipotecas, penhoras, arrestos, sequestros, usufruto, servidões, enfiteuse, bem como de quaisquer outras restrições que possam impedir a livre disposição e transferência de domínio.</p>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Do Preço e Forma de Pagamento</div>
    
    <div class="valor-box">
      <div class="valor">${formatarMoeda(valorVenda)}</div>
      <div class="extenso">(${valorPorExtenso(valorVenda)})</div>
    </div>

    <div class="clause">
      <p><span class="clause-title">CLÁUSULA 2ª -</span> O preço total e certo da presente transação é de <span class="highlight">${formatarMoeda(valorVenda)} (${valorPorExtenso(valorVenda)})</span>, que será pago pelo PROMITENTE COMPRADOR ao PROMITENTE VENDEDOR ${formaPagamentoTexto[form.formaPagamento] || '_________________________________'}.</p>
    </div>

    ${form.formaPagamento === 'financiamento' ? `
    <div class="clause">
      <p><span class="clause-title">CLÁUSULA 3ª -</span> A presente compra e venda está condicionada à aprovação do financiamento bancário junto ao ${form.bancoFinanciamento || '________________'}. Caso o financiamento não seja aprovado no prazo de 60 (sessenta) dias, o presente instrumento será rescindido automaticamente, devendo o PROMITENTE VENDEDOR restituir ao PROMITENTE COMPRADOR os valores eventualmente pagos a título de sinal.</p>
    </div>
    ` : ''}

    <div class="clause">
      <p><span class="clause-title">CLÁUSULA ${form.formaPagamento === 'financiamento' ? '4ª' : '3ª'} -</span> O pagamento do preço importa em quitação plena e irrevogável, operando-se a transferência de todos os direitos sobre o imóvel ao PROMITENTE COMPRADOR.</p>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Da Escritura e Registro</div>
    <div class="clause">
      <p><span class="clause-title">CLÁUSULA ${form.formaPagamento === 'financiamento' ? '5ª' : '4ª'} -</span> A escritura pública de compra e venda será lavrada no Cartório de Notas desta cidade, no prazo máximo de 30 (trinta) dias após a quitação integral do preço ou liberação dos recursos pelo agente financeiro, correndo as despesas de escritura e registro por conta do PROMITENTE COMPRADOR.</p>
    </div>
    <div class="clause">
      <p><span class="clause-title">CLÁUSULA ${form.formaPagamento === 'financiamento' ? '6ª' : '5ª'} -</span> O PROMITENTE VENDEDOR se compromete a fornecer todos os documentos necessários à lavratura da escritura e ao registro da transferência, incluindo certidões negativas de débitos.</p>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Da Posse</div>
    <div class="clause">
      <p><span class="clause-title">CLÁUSULA ${form.formaPagamento === 'financiamento' ? '7ª' : '6ª'} -</span> A posse do imóvel será transferida ao PROMITENTE COMPRADOR na data da assinatura da escritura pública de compra e venda, momento em que será realizada a vistoria final e entrega das chaves.</p>
    </div>
    <div class="clause">
      <p><span class="clause-title">CLÁUSULA ${form.formaPagamento === 'financiamento' ? '8ª' : '7ª'} -</span> A partir da data da imissão na posse, todas as despesas relativas ao imóvel, tais como IPTU, condomínio, água, luz, gás e demais encargos, serão de responsabilidade exclusiva do PROMITENTE COMPRADOR.</p>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Da Intermediação</div>
    <div class="clause">
      <p><span class="clause-title">CLÁUSULA ${form.formaPagamento === 'financiamento' ? '9ª' : '8ª'} -</span> A presente transação foi intermediada pela <span class="highlight">IMOBILIÁRIA PERTO</span>, CRECI _____________, a quem será devida comissão de corretagem no valor de <span class="highlight">${formatarMoeda(comissao)} (${valorPorExtenso(comissao)})</span>, correspondente a <span class="highlight">${form.percentualComissao}% (${valorPorExtenso(parseFloat(form.percentualComissao))} por cento)</span> do valor da venda, a ser paga pelo PROMITENTE VENDEDOR na data da assinatura da escritura.</p>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Das Penalidades</div>
    <div class="clause">
      <p><span class="clause-title">CLÁUSULA ${form.formaPagamento === 'financiamento' ? '10ª' : '9ª'} -</span> Em caso de desistência ou inadimplemento por parte do PROMITENTE COMPRADOR, este perderá em favor do PROMITENTE VENDEDOR, a título de multa compensatória, o valor correspondente a 20% (vinte por cento) do preço total do imóvel.</p>
    </div>
    <div class="clause">
      <p><span class="clause-title">CLÁUSULA ${form.formaPagamento === 'financiamento' ? '11ª' : '10ª'} -</span> Em caso de desistência ou inadimplemento por parte do PROMITENTE VENDEDOR, este devolverá ao PROMITENTE COMPRADOR o valor recebido em dobro, além de indenização por perdas e danos.</p>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Das Disposições Gerais</div>
    <div class="clause">
      <p><span class="clause-title">CLÁUSULA ${form.formaPagamento === 'financiamento' ? '12ª' : '11ª'} -</span> O PROMITENTE VENDEDOR declara que não existe qualquer impedimento legal para a realização desta venda e que o imóvel não responde por qualquer ação judicial, trabalhista, cível ou de qualquer natureza.</p>
    </div>
    <div class="clause">
      <p><span class="clause-title">CLÁUSULA ${form.formaPagamento === 'financiamento' ? '13ª' : '12ª'} -</span> O presente contrato é firmado em caráter irrevogável e irretratável, obrigando as partes, seus herdeiros e sucessores.</p>
    </div>
    ${form.clausulasAdicionais ? `
    <div class="clause">
      <p><span class="clause-title">CLÁUSULA ${form.formaPagamento === 'financiamento' ? '14ª' : '13ª'} - DISPOSIÇÕES ESPECIAIS:</span></p>
      <p style="margin-top: 10px;">${form.clausulasAdicionais}</p>
    </div>
    ` : ''}
  </div>

  <div class="section">
    <div class="section-title">Do Foro</div>
    <div class="clause">
      <p><span class="clause-title">CLÁUSULA ${form.formaPagamento === 'financiamento' ? (form.clausulasAdicionais ? '15ª' : '14ª') : (form.clausulasAdicionais ? '14ª' : '13ª')} -</span> Fica eleito o Foro da Comarca de <span class="highlight">${imovelSelecionado?.cidade || '_________'}/${imovelSelecionado?.estado || '__'}</span>, para dirimir quaisquer dúvidas oriundas do presente instrumento, com renúncia expressa a qualquer outro, por mais privilegiado que seja.</p>
    </div>
  </div>

  <p style="margin-top: 40px; text-align: justify;">
    E, por estarem assim justos e contratados, as partes assinam o presente instrumento em 03 (três) vias de igual teor e forma, na presença das testemunhas abaixo, para que produza seus jurídicos e legais efeitos.
  </p>

  <p style="text-align: right; margin-top: 40px;">
    ${imovelSelecionado?.cidade || '_________'}/${imovelSelecionado?.estado || '__'}, ${dataAssinatura}
  </p>

  <div class="signatures">
    <div class="signature-line">
      <div class="signature-box">
        <div class="line"></div>
        <div class="name">${imovelSelecionado?.proprietario?.nome || 'PROMITENTE VENDEDOR(A)'}</div>
        <div class="doc">CPF: ${imovelSelecionado?.proprietario?.cpfCnpj || '_______________'}</div>
      </div>
      <div class="signature-box">
        <div class="line"></div>
        <div class="name">${form.compradorNome || 'PROMITENTE COMPRADOR(A)'}</div>
        <div class="doc">CPF: ${form.compradorCpf || '_______________'}</div>
      </div>
    </div>

    ${form.compradorEstadoCivil === 'casado(a)' && form.conjugeNome ? `
    <div class="signature-line">
      <div class="signature-box">
        <div class="line"></div>
        <div class="name">${form.conjugeNome}</div>
        <div class="doc">CPF: ${form.conjugeCpf || '_______________'}</div>
        <div class="doc">(Cônjuge)</div>
      </div>
      <div class="signature-box"></div>
    </div>
    ` : ''}

    <div style="margin-top: 60px;">
      <p style="font-weight: bold; margin-bottom: 30px;">TESTEMUNHAS:</p>
      <div class="signature-line">
        <div class="signature-box">
          <div class="line"></div>
          <div class="name">1ª Testemunha</div>
          <div class="doc">Nome: _______________________</div>
          <div class="doc">CPF: _______________________</div>
        </div>
        <div class="signature-box">
          <div class="line"></div>
          <div class="name">2ª Testemunha</div>
          <div class="doc">Nome: _______________________</div>
          <div class="doc">CPF: _______________________</div>
        </div>
      </div>
    </div>

    <div style="margin-top: 60px; padding: 20px; border: 2px solid #333; background: #f9f9f9;">
      <p style="font-weight: bold; margin-bottom: 15px; text-align: center;">INTERMEDIAÇÃO IMOBILIÁRIA</p>
      <div class="signature-line" style="margin-top: 40px;">
        <div class="signature-box">
          <div class="line"></div>
          <div class="name">IMOBILIÁRIA PERTO</div>
          <div class="doc">CRECI: _____________</div>
        </div>
        <div class="signature-box">
          <div class="line"></div>
          <div class="name">Corretor Responsável</div>
          <div class="doc">CRECI: _____________</div>
        </div>
      </div>
    </div>
  </div>

  <div class="footer">
    <p>Documento gerado pelo Sistema Imobiliária Perto STR</p>
    <p>www.imobiliariaperto.com.br</p>
  </div>
</body>
</html>`;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Nova Venda</h1>
            <p className="text-gray-600">Registre uma venda e gere o contrato</p>
          </div>
          <Link href="/admin/vendas" className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">← Voltar</Link>
        </div>

        {error && <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}
        {contratoGerado && <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg">✅ Contrato gerado! Use Ctrl+P para salvar como PDF.</div>}

        <div className="bg-white rounded-lg shadow p-8 space-y-8">
          {/* Imóvel */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">🏠 Imóvel</h2>
            <select value={form.imovelId} onChange={e => handleImovelChange(e.target.value)} className="w-full p-3 border rounded-lg">
              <option value="">Selecione o imóvel...</option>
              {imoveis.map(i => <option key={i.id} value={i.id}>{i.tipo} - {i.endereco}, {i.cidade} - {formatarMoeda(Number(i.preco))}</option>)}
            </select>
            {imovelSelecionado && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p><strong>Proprietário:</strong> {imovelSelecionado.proprietario?.nome || 'Não informado'}</p>
                <p><strong>Endereço:</strong> {imovelSelecionado.endereco}, {imovelSelecionado.cidade}/{imovelSelecionado.estado}</p>
              </div>
            )}
          </div>

          {/* Comprador */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">👤 Comprador</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Lead Existente</label>
                <select value={form.compradorId} onChange={e => handleCompradorChange(e.target.value)} className="w-full p-3 border rounded-lg">
                  <option value="">Novo comprador...</option>
                  {leads.map(l => <option key={l.id} value={l.id}>{l.nome} - {l.telefone}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nome Completo *</label>
                <input value={form.compradorNome} onChange={e => setForm({...form, compradorNome: e.target.value})} className="w-full p-3 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">CPF *</label>
                <input value={form.compradorCpf} onChange={e => setForm({...form, compradorCpf: e.target.value})} className="w-full p-3 border rounded-lg" placeholder="000.000.000-00" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">RG</label>
                <input value={form.compradorRg} onChange={e => setForm({...form, compradorRg: e.target.value})} className="w-full p-3 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Estado Civil</label>
                <select value={form.compradorEstadoCivil} onChange={e => setForm({...form, compradorEstadoCivil: e.target.value})} className="w-full p-3 border rounded-lg">
                  <option value="solteiro(a)">Solteiro(a)</option>
                  <option value="casado(a)">Casado(a)</option>
                  <option value="divorciado(a)">Divorciado(a)</option>
                  <option value="viúvo(a)">Viúvo(a)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Profissão</label>
                <input value={form.compradorProfissao} onChange={e => setForm({...form, compradorProfissao: e.target.value})} className="w-full p-3 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Telefone</label>
                <input value={form.compradorTelefone} onChange={e => setForm({...form, compradorTelefone: e.target.value})} className="w-full p-3 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input value={form.compradorEmail} onChange={e => setForm({...form, compradorEmail: e.target.value})} className="w-full p-3 border rounded-lg" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">Endereço</label>
                <input value={form.compradorEndereco} onChange={e => setForm({...form, compradorEndereco: e.target.value})} className="w-full p-3 border rounded-lg" />
              </div>
            </div>

            {form.compradorEstadoCivil === 'casado(a)' && (
              <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                <h3 className="font-semibold mb-3">Dados do Cônjuge</h3>
                <div className="grid grid-cols-3 gap-4">
                  <input placeholder="Nome do Cônjuge" value={form.conjugeNome} onChange={e => setForm({...form, conjugeNome: e.target.value})} className="p-3 border rounded-lg" />
                  <input placeholder="CPF do Cônjuge" value={form.conjugeCpf} onChange={e => setForm({...form, conjugeCpf: e.target.value})} className="p-3 border rounded-lg" />
                  <input placeholder="RG do Cônjuge" value={form.conjugeRg} onChange={e => setForm({...form, conjugeRg: e.target.value})} className="p-3 border rounded-lg" />
                </div>
              </div>
            )}
          </div>

          {/* Corretor */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">👥 Corretor Responsável</h2>
            <select value={form.corretorId} onChange={e => setForm({...form, corretorId: e.target.value})} className="w-full p-3 border rounded-lg">
              <option value="">Selecione o corretor...</option>
              {corretores.map(c => <option key={c.id} value={c.id}>{c.nome} - CRECI: {c.creci}</option>)}
            </select>
          </div>

          {/* Valores */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">💰 Valores</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Valor da Venda *</label>
                <input type="number" value={form.valorVenda} onChange={e => setForm({...form, valorVenda: e.target.value})} className="w-full p-3 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Valor da Entrada</label>
                <input type="number" value={form.valorEntrada} onChange={e => setForm({...form, valorEntrada: e.target.value})} className="w-full p-3 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Valor Financiado</label>
                <input type="number" value={form.valorFinanciado} onChange={e => setForm({...form, valorFinanciado: e.target.value})} className="w-full p-3 border rounded-lg" />
              </div>
            </div>
          </div>

          {/* Forma de Pagamento */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">💳 Forma de Pagamento</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Forma</label>
                <select value={form.formaPagamento} onChange={e => setForm({...form, formaPagamento: e.target.value})} className="w-full p-3 border rounded-lg">
                  <option value="avista">À Vista</option>
                  <option value="financiamento">Financiamento Bancário</option>
                  <option value="parcelado">Parcelado Direto</option>
                </select>
              </div>
              {form.formaPagamento === 'financiamento' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Banco</label>
                  <input value={form.bancoFinanciamento} onChange={e => setForm({...form, bancoFinanciamento: e.target.value})} className="w-full p-3 border rounded-lg" placeholder="Ex: Caixa, Itaú, Bradesco..." />
                </div>
              )}
              {form.formaPagamento === 'parcelado' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Nº de Parcelas</label>
                  <input type="number" value={form.parcelas} onChange={e => setForm({...form, parcelas: e.target.value})} className="w-full p-3 border rounded-lg" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Comissão (%)</label>
                <input type="number" value={form.percentualComissao} onChange={e => setForm({...form, percentualComissao: e.target.value})} className="w-full p-3 border rounded-lg" />
              </div>
            </div>
          </div>

          {/* Datas */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">📅 Datas</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Data da Assinatura</label>
                <input type="date" value={form.dataAssinatura} onChange={e => setForm({...form, dataAssinatura: e.target.value})} className="w-full p-3 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Previsão da Escritura</label>
                <input type="date" value={form.dataEscritura} onChange={e => setForm({...form, dataEscritura: e.target.value})} className="w-full p-3 border rounded-lg" />
              </div>
            </div>
          </div>

          {/* Cláusulas Adicionais */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">📝 Cláusulas Adicionais</h2>
            <textarea value={form.clausulasAdicionais} onChange={e => setForm({...form, clausulasAdicionais: e.target.value})} rows={3} className="w-full p-3 border rounded-lg" placeholder="Cláusulas específicas para este contrato (opcional)" />
          </div>

          {/* Resumo */}
          <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="font-bold text-lg mb-4 text-green-800">📋 Resumo da Venda</h3>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-gray-500 text-sm">Valor da Venda</p>
                <p className="font-bold text-xl text-green-700">{formatarMoeda(parseFloat(form.valorVenda) || 0)}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Entrada</p>
                <p className="font-bold text-xl">{formatarMoeda(parseFloat(form.valorEntrada) || 0)}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Financiado</p>
                <p className="font-bold text-xl">{formatarMoeda(parseFloat(form.valorFinanciado) || 0)}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Comissão ({form.percentualComissao}%)</p>
                <p className="font-bold text-xl text-blue-600">{formatarMoeda(calcularComissao())}</p>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-4">
            <Link href="/admin/vendas" className="px-6 py-3 border rounded-lg hover:bg-gray-50">Cancelar</Link>
            <button onClick={handleGerarContrato} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">📄 Gerar Contrato PDF</button>
            <button onClick={handleSalvarVenda} disabled={loading} className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
              {loading ? 'Salvando...' : '💾 Salvar Venda'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
