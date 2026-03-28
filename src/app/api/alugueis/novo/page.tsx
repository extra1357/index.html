'use client';

export const dynamic = 'force-dynamic';


import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Imovel {
  id: string;
  tipo: string;
  endereco: string;
  cidade: string;
  estado: string;
  preco: number;
  precoAluguel?: number;
  proprietario?: {
    id: string;
    nome: string;
    cpfCnpj: string;
    telefone: string;
    email: string;
    endereco?: string;
  };
}

interface Lead {
  id: string;
  nome: string;
  email: string;
  telefone: string;
}

interface Corretor {
  id: string;
  nome: string;
  creci: string;
  telefone: string;
}

export default function NovoContratoAluguelPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [gerando, setGerando] = useState(false);
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [corretores, setCorretores] = useState<Corretor[]>([]);
  const [imovelSelecionado, setImovelSelecionado] = useState<Imovel | null>(null);
  const [error, setError] = useState('');
  const [contratoGerado, setContratoGerado] = useState(false);

  const [form, setForm] = useState({
    imovelId: '',
    inquilinoId: '',
    corretorId: '',
    // Dados do inquilino (caso não seja lead existente)
    inquilinoNome: '',
    inquilinoCpf: '',
    inquilinoRg: '',
    inquilinoNacionalidade: 'brasileiro(a)',
    inquilinoEstadoCivil: 'solteiro(a)',
    inquilinoProfissao: '',
    inquilinoEndereco: '',
    inquilinoEmail: '',
    inquilinoTelefone: '',
    // Valores
    valorAluguel: '',
    valorCondominio: '',
    valorIPTU: '',
    // Garantia
    tipoGarantia: 'caucao',
    valorGarantia: '',
    // Datas
    dataInicio: '',
    dataFim: '',
    diaVencimento: '10',
    // Contrato
    duracaoMeses: '12',
    indiceReajuste: 'IGPM',
    taxaAdministracao: '10',
    // Cláusulas adicionais
    clausulasAdicionais: '',
    finalidade: 'residencial',
  });

  useEffect(() => {
    // Carregar imóveis disponíveis para aluguel
    fetch('/api/imoveis?disponivel=true')
      .then((res: any) => res.json())
      .then((data: any) => setImoveis(Array.isArray(data) ? data : []))
      .catch(console.error);

    // Carregar leads
    fetch('/api/leads')
      .then((res: any) => res.json())
      .then((data: any) => setLeads(Array.isArray(data) ? data : []))
      .catch(console.error);

    // Carregar corretores
    fetch('/api/corretores?ativo=true')
      .then((res: any) => res.json())
      .then((data: any) => setCorretores(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  const handleImovelChange = (imovelId: string) => {
    setForm({ ...form, imovelId });
    const imovel = imoveis.find(i => i.id === imovelId);
    setImovelSelecionado(imovel || null);
    if (imovel?.precoAluguel) {
      setForm(prev => ({ ...prev, imovelId, valorAluguel: String(imovel.precoAluguel) }));
    }
  };

  const handleInquilinoChange = (inquilinoId: string) => {
    setForm({ ...form, inquilinoId });
    const lead = leads.find(l => l.id === inquilinoId);
    if (lead) {
      setForm(prev => ({
        ...prev,
        inquilinoId,
        inquilinoNome: lead.nome,
        inquilinoEmail: lead.email,
        inquilinoTelefone: lead.telefone,
      }));
    }
  };

  const calcularDataFim = (dataInicio: string, meses: string) => {
    if (!dataInicio) return '';
    const data = new Date(dataInicio);
    data.setMonth(data.getMonth() + parseInt(meses));
    return data.toISOString().split('T')[0];
  };

  const handleDuracaoChange = (meses: string) => {
    setForm(prev => ({
      ...prev,
      duracaoMeses: meses,
      dataFim: calcularDataFim(prev.dataInicio, meses)
    }));
  };

  const handleDataInicioChange = (dataInicio: string) => {
    setForm(prev => ({
      ...prev,
      dataInicio,
      dataFim: calcularDataFim(dataInicio, prev.duracaoMeses)
    }));
  };

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const valorPorExtenso = (valor: number): string => {
    const extenso: { [key: number]: string } = {
      0: 'zero', 1: 'um', 2: 'dois', 3: 'três', 4: 'quatro', 5: 'cinco',
      6: 'seis', 7: 'sete', 8: 'oito', 9: 'nove', 10: 'dez',
      11: 'onze', 12: 'doze', 13: 'treze', 14: 'quatorze', 15: 'quinze',
      16: 'dezesseis', 17: 'dezessete', 18: 'dezoito', 19: 'dezenove',
      20: 'vinte', 30: 'trinta', 40: 'quarenta', 50: 'cinquenta',
      60: 'sessenta', 70: 'setenta', 80: 'oitenta', 90: 'noventa',
      100: 'cem', 200: 'duzentos', 300: 'trezentos', 400: 'quatrocentos',
      500: 'quinhentos', 600: 'seiscentos', 700: 'setecentos',
      800: 'oitocentos', 900: 'novecentos', 1000: 'mil'
    };
    
    if (valor === 0) return 'zero reais';
    
    const inteiro = Math.floor(valor);
    const centavos = Math.round((valor - inteiro) * 100);
    
    let resultado = '';
    
    if (inteiro >= 1000) {
      const milhares = Math.floor(inteiro / 1000);
      if (milhares === 1) {
        resultado += 'mil';
      } else {
        resultado += extenso[milhares] + ' mil';
      }
      const resto = inteiro % 1000;
      if (resto > 0) {
        resultado += ' e ';
      }
    }
    
    const resto = inteiro % 1000;
    if (resto >= 100) {
      const centenas = Math.floor(resto / 100) * 100;
      resultado += extenso[centenas];
      const dezenas = resto % 100;
      if (dezenas > 0) {
        resultado += ' e ';
      }
    }
    
    const dezenas = resto % 100;
    if (dezenas > 0 && dezenas <= 20) {
      resultado += extenso[dezenas];
    } else if (dezenas > 20) {
      const dez = Math.floor(dezenas / 10) * 10;
      const uni = dezenas % 10;
      resultado += extenso[dez];
      if (uni > 0) {
        resultado += ' e ' + extenso[uni];
      }
    }
    
    resultado += inteiro === 1 ? ' real' : ' reais';
    
    if (centavos > 0) {
      resultado += ' e ' + centavos + (centavos === 1 ? ' centavo' : ' centavos');
    }
    
    return resultado;
  };

  const gerarContratoHTML = () => {
    const valorAluguel = parseFloat(form.valorAluguel) || 0;
    const valorCondominio = parseFloat(form.valorCondominio) || 0;
    const valorIPTU = parseFloat(form.valorIPTU) || 0;
    const valorTotal = valorAluguel + valorCondominio + valorIPTU;
    const valorGarantia = parseFloat(form.valorGarantia) || 0;

    const garantiaTexto: { [key: string]: string } = {
      'caucao': `caução no valor de ${formatarMoeda(valorGarantia)} (${valorPorExtenso(valorGarantia)}), a ser depositado em conta poupança em nome do LOCADOR`,
      'fiador': 'fiador idôneo, que apresentará documentação comprobatória de renda e patrimônio',
      'seguro_fianca': `seguro fiança locatícia, contratado junto à seguradora de escolha do LOCATÁRIO, no valor mínimo de ${formatarMoeda(valorGarantia)}`,
      'titulo_capitalizacao': `título de capitalização no valor de ${formatarMoeda(valorGarantia)} (${valorPorExtenso(valorGarantia)})`
    };

    const dataInicioFormatada = form.dataInicio ? new Date(form.dataInicio + 'T00:00:00').toLocaleDateString('pt-BR') : '';
    const dataFimFormatada = form.dataFim ? new Date(form.dataFim + 'T00:00:00').toLocaleDateString('pt-BR') : '';
    const dataHoje = new Date().toLocaleDateString('pt-BR');

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contrato de Locação - ${imovelSelecionado?.endereco || ''}</title>
  <style>
    @media print {
      body { margin: 0; padding: 20mm; }
      .no-print { display: none !important; }
      .page-break { page-break-before: always; }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.8;
      color: #000;
      background: #fff;
      padding: 40px;
      max-width: 210mm;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 3px double #000;
      padding-bottom: 20px;
    }
    .header h1 {
      font-size: 18pt;
      font-weight: bold;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .header h2 {
      font-size: 14pt;
      font-weight: normal;
    }
    .section {
      margin-bottom: 25px;
    }
    .section-title {
      font-weight: bold;
      font-size: 12pt;
      margin-bottom: 15px;
      text-transform: uppercase;
      border-bottom: 1px solid #000;
      padding-bottom: 5px;
    }
    .clause {
      margin-bottom: 20px;
      text-align: justify;
    }
    .clause-title {
      font-weight: bold;
      margin-bottom: 5px;
    }
    .parties {
      margin-bottom: 30px;
    }
    .party {
      margin-bottom: 20px;
      padding: 15px;
      background: #f9f9f9;
      border-left: 3px solid #333;
    }
    .party-title {
      font-weight: bold;
      font-size: 11pt;
      margin-bottom: 10px;
      text-transform: uppercase;
    }
    .signatures {
      margin-top: 60px;
      page-break-inside: avoid;
    }
    .signature-line {
      display: flex;
      justify-content: space-between;
      margin-top: 80px;
    }
    .signature-box {
      width: 45%;
      text-align: center;
    }
    .signature-box .line {
      border-top: 1px solid #000;
      margin-bottom: 5px;
      padding-top: 5px;
    }
    .signature-box .name {
      font-weight: bold;
    }
    .signature-box .doc {
      font-size: 10pt;
      color: #333;
    }
    .witnesses {
      margin-top: 60px;
    }
    .footer {
      margin-top: 40px;
      text-align: center;
      font-size: 10pt;
      color: #666;
      border-top: 1px solid #ccc;
      padding-top: 20px;
    }
    .highlight {
      font-weight: bold;
    }
    .btn-print {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #1e40af;
      color: white;
      padding: 15px 30px;
      border: none;
      border-radius: 8px;
      font-size: 14pt;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      z-index: 1000;
    }
    .btn-print:hover {
      background: #1e3a8a;
    }
  </style>
</head>
<body>
  <button class="btn-print no-print" onclick="window.print()">🖨️ Imprimir / Salvar PDF</button>

  <div class="header">
    <h1>Contrato de Locação de Imóvel ${form.finalidade === 'residencial' ? 'Residencial' : 'Comercial'}</h1>
    <h2>Lei do Inquilinato - Lei nº 8.245/91</h2>
  </div>

  <div class="parties">
    <div class="party">
      <div class="party-title">LOCADOR(A)</div>
      <p><strong>Nome:</strong> ${imovelSelecionado?.proprietario?.nome || '_________________________________'}</p>
      <p><strong>CPF/CNPJ:</strong> ${imovelSelecionado?.proprietario?.cpfCnpj || '_________________________________'}</p>
      <p><strong>Endereço:</strong> ${imovelSelecionado?.proprietario?.endereco || '_________________________________'}</p>
      <p><strong>Telefone:</strong> ${imovelSelecionado?.proprietario?.telefone || '_________________________________'}</p>
      <p><strong>E-mail:</strong> ${imovelSelecionado?.proprietario?.email || '_________________________________'}</p>
    </div>

    <div class="party">
      <div class="party-title">LOCATÁRIO(A)</div>
      <p><strong>Nome:</strong> ${form.inquilinoNome || '_________________________________'}</p>
      <p><strong>CPF:</strong> ${form.inquilinoCpf || '_________________________________'}</p>
      <p><strong>RG:</strong> ${form.inquilinoRg || '_________________________________'}</p>
      <p><strong>Nacionalidade:</strong> ${form.inquilinoNacionalidade}</p>
      <p><strong>Estado Civil:</strong> ${form.inquilinoEstadoCivil}</p>
      <p><strong>Profissão:</strong> ${form.inquilinoProfissao || '_________________________________'}</p>
      <p><strong>Endereço Atual:</strong> ${form.inquilinoEndereco || '_________________________________'}</p>
      <p><strong>Telefone:</strong> ${form.inquilinoTelefone || '_________________________________'}</p>
      <p><strong>E-mail:</strong> ${form.inquilinoEmail || '_________________________________'}</p>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Do Objeto</div>
    <div class="clause">
      <p><span class="clause-title">CLÁUSULA 1ª -</span> O presente contrato tem como objeto a locação do imóvel situado à <span class="highlight">${imovelSelecionado?.endereco || '_________________________________'}, ${imovelSelecionado?.cidade || '_________'}/${imovelSelecionado?.estado || '__'}</span>, destinado exclusivamente para fins <span class="highlight">${form.finalidade === 'residencial' ? 'residenciais' : 'comerciais'}</span>.</p>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Do Prazo</div>
    <div class="clause">
      <p><span class="clause-title">CLÁUSULA 2ª -</span> O prazo da locação é de <span class="highlight">${form.duracaoMeses} (${valorPorExtenso(parseInt(form.duracaoMeses))}) meses</span>, iniciando-se em <span class="highlight">${dataInicioFormatada}</span> e terminando em <span class="highlight">${dataFimFormatada}</span>, data em que o LOCATÁRIO se obriga a restituir o imóvel completamente desocupado, livre de pessoas e coisas, nas mesmas condições em que o recebeu, ressalvadas as deteriorações decorrentes do uso normal.</p>
    </div>
    <div class="clause">
      <p><span class="clause-title">CLÁUSULA 3ª -</span> Findo o prazo estipulado, caso o LOCATÁRIO permaneça no imóvel por mais de 30 (trinta) dias sem oposição do LOCADOR, presumir-se-á prorrogada a locação por prazo indeterminado, mantidas as demais cláusulas e condições deste contrato.</p>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Do Aluguel e Encargos</div>
    <div class="clause">
      <p><span class="clause-title">CLÁUSULA 4ª -</span> O aluguel mensal é de <span class="highlight">${formatarMoeda(valorAluguel)} (${valorPorExtenso(valorAluguel)})</span>, a ser pago até o dia <span class="highlight">${form.diaVencimento}</span> de cada mês, mediante depósito bancário, PIX ou boleto bancário em conta a ser indicada pelo LOCADOR.</p>
    </div>
    <div class="clause">
      <p><span class="clause-title">CLÁUSULA 5ª -</span> Além do aluguel, o LOCATÁRIO obriga-se a pagar:</p>
      <ul style="margin-left: 30px; margin-top: 10px;">
        ${valorCondominio > 0 ? `<li>Taxa de condomínio: <span class="highlight">${formatarMoeda(valorCondominio)}</span> mensais;</li>` : ''}
        ${valorIPTU > 0 ? `<li>IPTU proporcional: <span class="highlight">${formatarMoeda(valorIPTU)}</span> mensais;</li>` : ''}
        <li>Consumo de água, luz, gás e demais taxas que recaiam sobre o imóvel;</li>
        <li>Seguro contra incêndio, conforme apólice indicada pelo LOCADOR.</li>
      </ul>
      <p style="margin-top: 15px;"><strong>VALOR TOTAL MENSAL: ${formatarMoeda(valorTotal)} (${valorPorExtenso(valorTotal)})</strong></p>
    </div>
    <div class="clause">
      <p><span class="clause-title">CLÁUSULA 6ª -</span> O aluguel será reajustado anualmente, na data de aniversário deste contrato, pelo índice <span class="highlight">${form.indiceReajuste}</span> (Índice Geral de Preços do Mercado) acumulado no período, ou outro índice que venha a substituí-lo.</p>
    </div>
    <div class="clause">
      <p><span class="clause-title">CLÁUSULA 7ª -</span> O atraso no pagamento do aluguel e encargos sujeitará o LOCATÁRIO ao pagamento de multa de <span class="highlight">10% (dez por cento)</span> sobre o valor devido, acrescido de juros de mora de <span class="highlight">1% (um por cento)</span> ao mês, calculados pro rata die.</p>
    </div>
  </div>

  <div class="section page-break">
    <div class="section-title">Da Garantia</div>
    <div class="clause">
      <p><span class="clause-title">CLÁUSULA 8ª -</span> Como garantia das obrigações assumidas neste contrato, o LOCATÁRIO oferece ${garantiaTexto[form.tipoGarantia] || '_________________________________'}.</p>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Das Obrigações do Locatário</div>
    <div class="clause">
      <p><span class="clause-title">CLÁUSULA 9ª -</span> Constituem obrigações do LOCATÁRIO:</p>
      <ul style="margin-left: 30px; margin-top: 10px;">
        <li>Pagar pontualmente o aluguel e demais encargos no prazo estipulado;</li>
        <li>Servir-se do imóvel para o uso convencionado, de modo a não prejudicar o sossego, a saúde e a segurança dos vizinhos;</li>
        <li>Restituir o imóvel, finda a locação, no estado em que o recebeu, salvo as deteriorações decorrentes do uso normal;</li>
        <li>Levar ao conhecimento do LOCADOR o surgimento de qualquer dano ou defeito cuja reparação a este incumba;</li>
        <li>Realizar a imediata reparação dos danos verificados no imóvel, ou nas suas instalações, provocados por si, seus dependentes, familiares, visitantes ou prepostos;</li>
        <li>Não modificar a forma interna ou externa do imóvel sem o consentimento prévio e por escrito do LOCADOR;</li>
        <li>Entregar ao LOCADOR os documentos de cobrança de tributos e encargos condominiais, bem como qualquer intimação, multa ou exigência de autoridade pública;</li>
        <li>Pagar as despesas de luz, água, esgoto, gás e demais encargos que recaiam sobre o imóvel;</li>
        <li>Permitir a vistoria do imóvel pelo LOCADOR ou seu mandatário, mediante combinação prévia de dia e hora.</li>
      </ul>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Das Obrigações do Locador</div>
    <div class="clause">
      <p><span class="clause-title">CLÁUSULA 10ª -</span> Constituem obrigações do LOCADOR:</p>
      <ul style="margin-left: 30px; margin-top: 10px;">
        <li>Entregar ao LOCATÁRIO o imóvel em estado de servir ao uso a que se destina;</li>
        <li>Garantir, durante o tempo da locação, o uso pacífico do imóvel locado;</li>
        <li>Manter, durante a locação, a forma e o destino do imóvel;</li>
        <li>Responder pelos vícios ou defeitos anteriores à locação;</li>
        <li>Fornecer ao LOCATÁRIO recibo discriminado das importâncias pagas;</li>
        <li>Pagar as taxas de administração imobiliária e de intermediação;</li>
        <li>Pagar os impostos e taxas que incidam sobre o imóvel, salvo disposição em contrário.</li>
      </ul>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Da Rescisão</div>
    <div class="clause">
      <p><span class="clause-title">CLÁUSULA 11ª -</span> O LOCATÁRIO poderá devolver o imóvel antes do término do prazo contratual, mediante o pagamento de multa equivalente a <span class="highlight">03 (três) aluguéis vigentes</span>, proporcionalmente reduzida ao tempo restante do contrato, conforme artigo 4º da Lei 8.245/91.</p>
    </div>
    <div class="clause">
      <p><span class="clause-title">CLÁUSULA 12ª -</span> A infração de qualquer cláusula deste contrato, por qualquer das partes, facultará à outra considerar rescindida a locação, respondendo o infrator pelos prejuízos causados.</p>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Das Disposições Gerais</div>
    <div class="clause">
      <p><span class="clause-title">CLÁUSULA 13ª -</span> O LOCATÁRIO desde já autoriza o LOCADOR ou seu representante legal a vistoriar o imóvel sempre que necessário, desde que previamente avisado com antecedência mínima de 24 (vinte e quatro) horas.</p>
    </div>
    <div class="clause">
      <p><span class="clause-title">CLÁUSULA 14ª -</span> Em caso de sinistro parcial ou total do imóvel, o presente contrato ficará rescindido de pleno direito, independentemente de notificação judicial ou extrajudicial.</p>
    </div>
    <div class="clause">
      <p><span class="clause-title">CLÁUSULA 15ª -</span> O presente contrato obriga as partes, seus herdeiros e sucessores.</p>
    </div>
    ${form.clausulasAdicionais ? `
    <div class="clause">
      <p><span class="clause-title">CLÁUSULA 16ª - DISPOSIÇÕES ESPECIAIS:</span></p>
      <p style="margin-top: 10px;">${form.clausulasAdicionais}</p>
    </div>
    ` : ''}
  </div>

  <div class="section">
    <div class="section-title">Do Foro</div>
    <div class="clause">
      <p><span class="clause-title">CLÁUSULA ${form.clausulasAdicionais ? '17ª' : '16ª'} -</span> Para dirimir quaisquer dúvidas oriundas do presente contrato, as partes elegem o Foro da Comarca de <span class="highlight">${imovelSelecionado?.cidade || '_________'}/${imovelSelecionado?.estado || '__'}</span>, com exclusão de qualquer outro, por mais privilegiado que seja.</p>
    </div>
  </div>

  <p style="margin-top: 40px; text-align: justify;">
    E, por estarem assim justos e contratados, firmam o presente instrumento em 02 (duas) vias de igual teor e forma, na presença das testemunhas abaixo, para que produza seus jurídicos e legais efeitos.
  </p>

  <p style="text-align: right; margin-top: 40px;">
    ${imovelSelecionado?.cidade || '_________'}/${imovelSelecionado?.estado || '__'}, ${dataHoje}
  </p>

  <div class="signatures">
    <div class="signature-line">
      <div class="signature-box">
        <div class="line"></div>
        <div class="name">${imovelSelecionado?.proprietario?.nome || 'LOCADOR(A)'}</div>
        <div class="doc">CPF: ${imovelSelecionado?.proprietario?.cpfCnpj || '_______________'}</div>
      </div>
      <div class="signature-box">
        <div class="line"></div>
        <div class="name">${form.inquilinoNome || 'LOCATÁRIO(A)'}</div>
        <div class="doc">CPF: ${form.inquilinoCpf || '_______________'}</div>
      </div>
    </div>

    <div class="witnesses">
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
  </div>

  <div class="footer">
    <p>Contrato gerado pelo Sistema Imobiliária Perto STR</p>
    <p>www.imobiliariaperto.com.br</p>
  </div>
</body>
</html>
    `;
  };

  const handleGerarContrato = () => {
    if (!form.imovelId || !form.inquilinoNome || !form.valorAluguel || !form.dataInicio) {
      setError('Preencha todos os campos obrigatórios: Imóvel, Nome do Inquilino, Valor do Aluguel e Data de Início');
      return;
    }

    setGerando(true);
    setError('');

    setTimeout(() => {
      const contratoHTML = gerarContratoHTML();
      const blob = new Blob([contratoHTML], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      // Abre em nova aba para impressão/download como PDF
      const novaJanela = window.open(url, '_blank');
      if (novaJanela) {
        novaJanela.focus();
      }
      
      setGerando(false);
      setContratoGerado(true);
    }, 500);
  };

  const handleSalvarContrato = async () => {
    if (!form.imovelId || !form.inquilinoNome || !form.corretorId || !form.valorAluguel || !form.dataInicio) {
      setError('Preencha todos os campos obrigatórios para salvar o contrato');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Primeiro, cria o lead se não existir
      let inquilinoId = form.inquilinoId;
      
      if (!inquilinoId) {
        const leadRes = await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nome: form.inquilinoNome,
            email: form.inquilinoEmail,
            telefone: form.inquilinoTelefone,
            origem: 'contrato_aluguel',
            status: 'fechado'
          })
        });
        const leadData = await leadRes.json();
        inquilinoId = leadData.id;
      }

      // Depois, cria o contrato de aluguel
      const response = await fetch('/api/alugueis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imovelId: form.imovelId,
          inquilinoId: inquilinoId,
          corretorId: form.corretorId,
          valorAluguel: parseFloat(form.valorAluguel),
          valorCondominio: form.valorCondominio ? parseFloat(form.valorCondominio) : null,
          valorIPTU: form.valorIPTU ? parseFloat(form.valorIPTU) : null,
          tipoGarantia: form.tipoGarantia,
          valorGarantia: form.valorGarantia ? parseFloat(form.valorGarantia) : null,
          dataInicio: form.dataInicio,
          dataFim: form.dataFim,
          diaVencimento: parseInt(form.diaVencimento),
          indiceReajuste: form.indiceReajuste,
          taxaAdministracao: parseFloat(form.taxaAdministracao),
          observacoes: form.clausulasAdicionais
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar contrato');
      }

      router.push('/admin/alugueis');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Novo Contrato de Aluguel</h1>
            <p className="text-gray-600">Preencha os dados e gere o contrato para assinatura</p>
          </div>
          <Link
            href="/admin/alugueis"
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            ← Voltar
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {contratoGerado && (
          <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg">
            ✅ Contrato gerado com sucesso! Uma nova aba foi aberta. Use Ctrl+P ou o botão "Imprimir" para salvar como PDF.
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-8">
          {/* Imóvel */}
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">📍 Imóvel</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Selecione o Imóvel *</label>
              <select
                value={form.imovelId}
                onChange={(e: any) => handleImovelChange(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Selecione...</option>
                {imoveis.map((imovel: any) => (
                  <option key={imovel.id} value={imovel.id}>
                    {imovel.tipo} - {imovel.endereco}, {imovel.cidade}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Finalidade</label>
              <select
                value={form.finalidade}
                onChange={(e: any) => setForm({ ...form, finalidade: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="residencial">Residencial</option>
                <option value="comercial">Comercial</option>
              </select>
            </div>
          </div>

          {imovelSelecionado && (
            <div className="mb-8 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Proprietário:</strong> {imovelSelecionado.proprietario?.nome || 'Não informado'}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Endereço:</strong> {imovelSelecionado.endereco}, {imovelSelecionado.cidade}/{imovelSelecionado.estado}
              </p>
            </div>
          )}

          {/* Inquilino */}
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">👤 Inquilino (Locatário)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Lead Existente (opcional)</label>
              <select
                value={form.inquilinoId}
                onChange={(e: any) => handleInquilinoChange(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Novo inquilino...</option>
                {leads.map((lead: any) => (
                  <option key={lead.id} value={lead.id}>
                    {lead.nome} - {lead.telefone}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo *</label>
              <input
                type="text"
                value={form.inquilinoNome}
                onChange={(e: any) => setForm({ ...form, inquilinoNome: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CPF *</label>
              <input
                type="text"
                value={form.inquilinoCpf}
                onChange={(e: any) => setForm({ ...form, inquilinoCpf: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="000.000.000-00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">RG</label>
              <input
                type="text"
                value={form.inquilinoRg}
                onChange={(e: any) => setForm({ ...form, inquilinoRg: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nacionalidade</label>
              <input
                type="text"
                value={form.inquilinoNacionalidade}
                onChange={(e: any) => setForm({ ...form, inquilinoNacionalidade: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado Civil</label>
              <select
                value={form.inquilinoEstadoCivil}
                onChange={(e: any) => setForm({ ...form, inquilinoEstadoCivil: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="solteiro(a)">Solteiro(a)</option>
                <option value="casado(a)">Casado(a)</option>
                <option value="divorciado(a)">Divorciado(a)</option>
                <option value="viúvo(a)">Viúvo(a)</option>
                <option value="união estável">União Estável</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Profissão</label>
              <input
                type="text"
                value={form.inquilinoProfissao}
                onChange={(e: any) => setForm({ ...form, inquilinoProfissao: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
              <input
                type="tel"
                value={form.inquilinoTelefone}
                onChange={(e: any) => setForm({ ...form, inquilinoTelefone: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={form.inquilinoEmail}
                onChange={(e: any) => setForm({ ...form, inquilinoEmail: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Endereço Atual</label>
              <input
                type="text"
                value={form.inquilinoEndereco}
                onChange={(e: any) => setForm({ ...form, inquilinoEndereco: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Corretor */}
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">👥 Corretor Responsável</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Corretor *</label>
              <select
                value={form.corretorId}
                onChange={(e: any) => setForm({ ...form, corretorId: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Selecione...</option>
                {corretores.map((corretor: any) => (
                  <option key={corretor.id} value={corretor.id}>
                    {corretor.nome} - CRECI: {corretor.creci}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Valores */}
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">💰 Valores</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Valor do Aluguel *</label>
              <input
                type="number"
                value={form.valorAluguel}
                onChange={(e: any) => setForm({ ...form, valorAluguel: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0,00"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Condomínio</label>
              <input
                type="number"
                value={form.valorCondominio}
                onChange={(e: any) => setForm({ ...form, valorCondominio: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0,00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">IPTU (mensal)</label>
              <input
                type="number"
                value={form.valorIPTU}
                onChange={(e: any) => setForm({ ...form, valorIPTU: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0,00"
              />
            </div>
          </div>

          {/* Garantia */}
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">🔒 Garantia</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Garantia</label>
              <select
                value={form.tipoGarantia}
                onChange={(e: any) => setForm({ ...form, tipoGarantia: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="caucao">Caução (depósito)</option>
                <option value="fiador">Fiador</option>
                <option value="seguro_fianca">Seguro Fiança</option>
                <option value="titulo_capitalizacao">Título de Capitalização</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Valor da Garantia</label>
              <input
                type="number"
                value={form.valorGarantia}
                onChange={(e: any) => setForm({ ...form, valorGarantia: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="0,00"
              />
            </div>
          </div>

          {/* Prazo */}
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">📅 Prazo do Contrato</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data de Início *</label>
              <input
                type="date"
                value={form.dataInicio}
                onChange={(e: any) => handleDataInicioChange(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duração</label>
              <select
                value={form.duracaoMeses}
                onChange={(e: any) => handleDuracaoChange(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="12">12 meses</option>
                <option value="24">24 meses</option>
                <option value="30">30 meses</option>
                <option value="36">36 meses</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data de Término</label>
              <input
                type="date"
                value={form.dataFim}
                readOnly
                className="w-full px-4 py-2 border rounded-lg bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dia Vencimento</label>
              <select
                value={form.diaVencimento}
                onChange={(e: any) => setForm({ ...form, diaVencimento: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {[1, 5, 10, 15, 20, 25].map(dia => (
                  <option key={dia} value={dia}>Dia {dia}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Reajuste */}
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">📈 Reajuste</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Índice de Reajuste</label>
              <select
                value={form.indiceReajuste}
                onChange={(e: any) => setForm({ ...form, indiceReajuste: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="IGPM">IGP-M (FGV)</option>
                <option value="IPCA">IPCA (IBGE)</option>
                <option value="INPC">INPC (IBGE)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Taxa de Administração (%)</label>
              <input
                type="number"
                value={form.taxaAdministracao}
                onChange={(e: any) => setForm({ ...form, taxaAdministracao: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="10"
              />
            </div>
          </div>

          {/* Cláusulas Adicionais */}
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">📝 Cláusulas Adicionais</h2>
          <div className="mb-8">
            <textarea
              value={form.clausulasAdicionais}
              onChange={(e: any) => setForm({ ...form, clausulasAdicionais: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Adicione cláusulas específicas para este contrato (opcional)"
            />
          </div>

          {/* Resumo */}
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h3 className="font-bold text-lg mb-4">📋 Resumo do Contrato</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Aluguel</p>
                <p className="font-bold text-lg">R$ {parseFloat(form.valorAluguel || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div>
                <p className="text-gray-500">Condomínio</p>
                <p className="font-bold text-lg">R$ {parseFloat(form.valorCondominio || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div>
                <p className="text-gray-500">IPTU</p>
                <p className="font-bold text-lg">R$ {parseFloat(form.valorIPTU || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div>
                <p className="text-gray-500">Total Mensal</p>
                <p className="font-bold text-lg text-green-600">
                  R$ {(parseFloat(form.valorAluguel || '0') + parseFloat(form.valorCondominio || '0') + parseFloat(form.valorIPTU || '0')).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-4">
            <Link
              href="/admin/alugueis"
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </Link>
            <button
              type="button"
              onClick={handleGerarContrato}
              disabled={gerando}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {gerando ? 'Gerando...' : '📄 Gerar Contrato PDF'}
            </button>
            <button
              type="button"
              onClick={handleSalvarContrato}
              disabled={loading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Salvando...' : '💾 Salvar no Sistema'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
