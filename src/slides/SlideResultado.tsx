import { motion } from 'framer-motion';
import { ChartPanel } from '../components/ui/ChartPanel';
import { MetricCard } from '../components/ui/MetricCard';
import { SlideWrapper } from '../components/layout/SlideWrapper';
import { MonthlyRow, Transportadora } from '../types';
import {
  brNumber,
  companiesForMonth,
  companyMonthTotals,
  getMonthKeys,
  monthLabel,
  share,
  sumRows,
  totalByMonth,
  transportadoraTotals,
} from '../utils/metrics';

interface SlideResultadoProps {
  rows: MonthlyRow[];
  meta: number;
}

/**
 * Animação padrão das seções da página Resultado.
 */
const reveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.45 },
};

/**
 * Percentuais com uma casa decimal.
 * Exemplo: 0.4654 -> 46,5%
 */
const brPercent1 = new Intl.NumberFormat('pt-BR', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

/**
 * Helpers de percentual.
 * Os gráficos recebem valores de 0 a 100.
 */
const pct = (value: number) => value * 100;
const pctFmt = (value: number) => `${value.toFixed(1).replace('.', ',')}%`;

/**
 * Diferença entre dois percentuais.
 * Exemplo: 46,5% para 38,5% = 8,1 p.p.
 */
const ppFmt = (value: number) => `${(value * 100).toFixed(1).replace('.', ',')} p.p.`;
const signedPpFmt = (value: number) => {
  const sign = value > 0 ? '+' : '';
  return `${sign}${ppFmt(value)}`;
};

/**
 * Paleta dos indicadores.
 */
const colorProprio = '#2563eb'; // azul
const colorFrota = '#2563eb'; // azul
const colorTranspredi = '#60a5fa'; // azul claro
const colorTerceiro = '#da0d0d'; // vermelho
const colorFob = '#f59e0b'; // laranja

/**
 * Cores de leitura dos cards/tabela.
 */
const green = '#37a169';
const muted = '#7c6570';
const ink = '#2e1a20';
const line = '#f1dce2';
const soft = '#fff1f4';

export function SlideResultado({ rows, meta }: SlideResultadoProps) {
  /**
   * Identifica os meses existentes na aba Resultado.
   * Se por algum motivo o Excel não carregar os meses, usa maio e junho como fallback.
   */
  const [maio = '2026-05', junho = '2026-06'] = getMonthKeys(rows);

  /**
   * Totais por modalidade no grupo.
   */
  const maioTotals = transportadoraTotals(rows, maio);
  const junhoTotals = transportadoraTotals(rows, junho);
  const maioTotal = totalByMonth(rows, maio);
  const junhoTotal = totalByMonth(rows, junho);

  /**
   * Operação interna = Frota própria + Transpredi.
   */
  const maioInterno = maioTotals.Frota + maioTotals.Transpredi;
  const junhoInterno = junhoTotals.Frota + junhoTotals.Transpredi;

  /**
   * Participação percentual do grupo.
   */
  const grupoTerceirosMaio = share(maioTotals.Terceiro, maioTotal);
  const grupoTerceirosJunho = share(junhoTotals.Terceiro, junhoTotal);

  const grupoInternoMaio = share(maioInterno, maioTotal);
  const grupoInternoJunho = share(junhoInterno, junhoTotal);

  /**
   * FOB é o cliente retirando. Mantido como FOB em todos os rótulos.
   */
  const grupoFobMaio = share(maioTotals.FOB, maioTotal);
  const grupoFobJunho = share(junhoTotals.FOB, junhoTotal);

  /**
   * Ranking base de junho, ordenado do menor para o maior percentual de terceiros.
   */
  const companies = companiesForMonth(rows, junho)
    .map((company) => {
      const totals = companyMonthTotals(rows, junho, company);

      return {
        company,
        proprioShare: share(totals.proprio, totals.total),
        terceiroShare: share(totals.terceiro, totals.total),
        total: totals.total,
      };
    })
    .sort((a, b) => a.terceiroShare - b.terceiroShare);

  const bestCompany = companies[0];

  /**
   * Algumas empresas aparecem com nomes diferentes entre bases.
   * Esse alias ajuda a somar corretamente quando houver variações.
   */
  function getCompanyAliases(company: string): string[] {
    const clean = company
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\+/g, '')
      .trim()
      .toLowerCase();

    if (clean === 'predilecta') return ['Predilecta'];
    if (clean === 'sofruta') return ['SóFruta', 'Sófruta', 'So Fruta'];
    if (clean === 'stelladoro' || clean === 'stella') {
      return ['StellaDóro', 'Stella', 'STELLA D´ORO'];
    }
    if (clean === 'minas') return ['Minas+', 'Minas', 'MINAS MAIS'];
    if (clean === 'salsaretti') return ['Salsaretti'];
    if (clean === 'nordeste') return ['Nordeste', 'Nordeste Mais'];
    if (clean === 'goias') return ['Goiás', 'Goias'];

    return [company];
  }

  /**
   * Normalização local usada apenas para não somar alias duplicado.
   */
  function aliasKey(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\+/g, '')
      .trim()
      .toLowerCase();
  }

  /**
   * Soma por empresa considerando aliases, mas evitando duplicidade.
   */
  function sumCompany(
    mesKey: string,
    company: string,
    transportadora?: Transportadora
  ): number {
    const aliases = getCompanyAliases(company);
    const uniqueAliases = aliases.filter((alias, index) => {
      return aliases.findIndex((item) => aliasKey(item) === aliasKey(alias)) === index;
    });

    return uniqueAliases.reduce((total, alias) => {
      return total + sumRows(rows, { mesKey, cliente: alias, transportadora });
    }, 0);
  }

  /**
   * Totais por empresa para maio/junho.
   */
  function companyTotalsByAlias(mesKey: string, company: string) {
    const frota = sumCompany(mesKey, company, 'Frota');
    const transpredi = sumCompany(mesKey, company, 'Transpredi');
    const terceiro = sumCompany(mesKey, company, 'Terceiro');
    const fob = sumCompany(mesKey, company, 'FOB');
    const proprio = frota + transpredi;
    const total = proprio + terceiro + fob;

    return {
      frota,
      transpredi,
      terceiro,
      fob,
      proprio,
      total,
      terceiroShare: share(terceiro, total),
      proprioShare: share(proprio, total),
      fobShare: share(fob, total),
    };
  }

  /**
   * Tabela de resultado por empresa.
   * Ordenada do maior percentual de terceiros em junho para o menor.
   */
  const resultadoPorEmpresa = companiesForMonth(rows, junho)
    .map((company) => {
      const maioEmpresa = companyTotalsByAlias(maio, company);
      const junhoEmpresa = companyTotalsByAlias(junho, company);

      return {
        company,

        // Comparativo de terceiros entre maio e junho.
        maioTerceiroShare: maioEmpresa.terceiroShare,
        junhoTerceiroShare: junhoEmpresa.terceiroShare,
        melhorou: junhoEmpresa.terceiroShare < maioEmpresa.terceiroShare,

        // Base de junho para os gráficos finais.
        junhoProprio: junhoEmpresa.proprio,
        junhoTerceiro: junhoEmpresa.terceiro,
        junhoFob: junhoEmpresa.fob,
        junhoTotal: junhoEmpresa.total,
        junhoProprioShare: junhoEmpresa.proprioShare,
        junhoFobShare: junhoEmpresa.fobShare,
      };
    })
    .sort((a, b) => b.junhoTerceiroShare - a.junhoTerceiroShare);

  /**
   * Flags para colorir os cards gerais.
   */
  const grupoTerceiroMelhorou = grupoTerceirosJunho < grupoTerceirosMaio;
  const grupoInternoMelhorou = grupoInternoJunho > grupoInternoMaio;

  /**
   * Métricas corrigidas:
   * Antes estava calculando variação sobre volume absoluto:
   * (1.025 - 828) / 1.025 = 19%.
   * Agora calcula a diferença entre os percentuais mensais:
   * 46,5% - 38,5% = 8,1 p.p.
   */
 const reducaoTerceirosPontos = grupoTerceirosMaio - grupoTerceirosJunho;
const aumentoInternoPontos = grupoInternoJunho - grupoInternoMaio;

const reducaoTerceirosPercentual = share(reducaoTerceirosPontos, grupoTerceirosMaio);
const aumentoInternoPercentual = share(aumentoInternoPontos, grupoInternoMaio);

const pontosPercentuaisFmt = (value: number) =>
  `${(value * 100).toFixed(1).replace('.', ',')} p.p.`;

  /**
   * Gráfico 1:
   * Comparação percentual entre operação interna, terceiros e FOB.
   */
  const optionInternoTerceiroPercentual = {
    color: [colorProprio, colorTerceiro, colorFob],
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      valueFormatter: (value: number) => pctFmt(value),
    },
    legend: {
      bottom: 0,
      textStyle: { color: '#675056', fontWeight: 700 },
    },
    grid: { left: 48, right: 18, top: 28, bottom: 50 },
    xAxis: {
      type: 'category',
      data: [monthLabel(maio), monthLabel(junho)],
      axisLine: { lineStyle: { color: '#ead5db' } },
    },
    yAxis: {
      type: 'value',
      max: 70,
      axisLabel: { formatter: '{value}%' },
      splitLine: { lineStyle: { color: '#f3e2e6' } },
    },
    series: [
      {
        name: 'Próprio + Transpredi',
        type: 'bar',
        data: [pct(grupoInternoMaio), pct(grupoInternoJunho)],
        itemStyle: { color: colorProprio, borderRadius: [10, 10, 0, 0] },
      },
      {
        name: 'Terceiro',
        type: 'bar',
        data: [pct(grupoTerceirosMaio), pct(grupoTerceirosJunho)],
        itemStyle: { color: colorTerceiro, borderRadius: [10, 10, 0, 0] },
      },
      {
        name: 'FOB',
        type: 'bar',
        data: [pct(grupoFobMaio), pct(grupoFobJunho)],
        itemStyle: { color: colorFob, borderRadius: [10, 10, 0, 0] },
      },
    ],
  };

  /**
   * Gráfico 2:
   * Composição por modalidade.
   * Cada modalidade é uma série própria para garantir a cor correta:
   * Frota azul, Transpredi azul claro, Terceiro vermelho e FOB laranja.
   */
  const optionComposicaoPercentual = {
    color: [colorFrota, colorTranspredi, colorTerceiro, colorFob],
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      valueFormatter: (value: number) => pctFmt(value),
    },
    legend: {
      bottom: 0,
      textStyle: { color: '#675056', fontWeight: 700 },
    },
    grid: { left: 48, right: 18, top: 28, bottom: 50 },
    xAxis: {
      type: 'category',
      data: [monthLabel(maio), monthLabel(junho)],
      axisLine: { lineStyle: { color: '#ead5db' } },
    },
    yAxis: {
      type: 'value',
      max: 65,
      axisLabel: { formatter: '{value}%' },
      splitLine: { lineStyle: { color: '#f3e2e6' } },
    },
    series: [
      {
        name: 'Frota',
        type: 'bar',
        data: [
          pct(share(maioTotals.Frota, maioTotal)),
          pct(share(junhoTotals.Frota, junhoTotal)),
        ],
        itemStyle: { color: colorFrota, borderRadius: [10, 10, 0, 0] },
      },
      {
        name: 'Transpredi',
        type: 'bar',
        data: [
          pct(share(maioTotals.Transpredi, maioTotal)),
          pct(share(junhoTotals.Transpredi, junhoTotal)),
        ],
        itemStyle: { color: colorTranspredi, borderRadius: [10, 10, 0, 0] },
      },
      {
        name: 'Terceiro',
        type: 'bar',
        data: [
          pct(share(maioTotals.Terceiro, maioTotal)),
          pct(share(junhoTotals.Terceiro, junhoTotal)),
        ],
        itemStyle: { color: colorTerceiro, borderRadius: [10, 10, 0, 0] },
      },
      {
        name: 'FOB',
        type: 'bar',
        data: [
          pct(share(maioTotals.FOB, maioTotal)),
          pct(share(junhoTotals.FOB, junhoTotal)),
        ],
        itemStyle: { color: colorFob, borderRadius: [10, 10, 0, 0] },
      },
    ],
  };

  /**
   * Gráfico 3A:
   * Composição por empresa em percentual.
   * Compara apenas os agrupamentos corretos:
   * Próprio + Transpredi, Terceiro e FOB.
   */
  const optionRanking = {
    color: [colorProprio, colorTerceiro, colorFob],
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      valueFormatter: (value: number) => pctFmt(value),
    },
    legend: { bottom: 0, textStyle: { color: '#675056', fontWeight: 700 } },
    grid: { left: 92, right: 18, top: 28, bottom: 52 },
    xAxis: {
      type: 'value',
      max: 100,
      axisLabel: { formatter: '{value}%' },
      splitLine: { lineStyle: { color: '#f3e2e6' } },
    },
    yAxis: {
      type: 'category',
      data: resultadoPorEmpresa.map((item) => item.company),
      axisLine: { lineStyle: { color: '#ead5db' } },
    },
    series: [
      {
        name: 'Próprio + Transpredi',
        type: 'bar',
        stack: 'total',
        data: resultadoPorEmpresa.map((item) => pct(item.junhoProprioShare)),
        itemStyle: { color: colorProprio },
      },
      {
        name: 'Terceiro',
        type: 'bar',
        stack: 'total',
        data: resultadoPorEmpresa.map((item) => pct(item.junhoTerceiroShare)),
        itemStyle: { color: colorTerceiro },
      },
      {
        name: 'FOB',
        type: 'bar',
        stack: 'total',
        data: resultadoPorEmpresa.map((item) => pct(item.junhoFobShare)),
        itemStyle: { color: colorFob, borderRadius: [0, 8, 8, 0] },
      },
    ],
  };

  /**
   * Gráfico 3B:
   * Mesmo comparativo, mas em quantidade absoluta de serviços.
   */
  const optionRankingQuantidade = {
    color: [colorProprio, colorTerceiro, colorFob],
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      valueFormatter: (value: number) => brNumber.format(value),
    },
    legend: { bottom: 0, textStyle: { color: '#675056', fontWeight: 700 } },
    grid: { left: 92, right: 18, top: 28, bottom: 52 },
    xAxis: {
      type: 'value',
      axisLabel: { formatter: (value: number) => brNumber.format(value) },
      splitLine: { lineStyle: { color: '#f3e2e6' } },
    },
    yAxis: {
      type: 'category',
      data: resultadoPorEmpresa.map((item) => item.company),
      axisLine: { lineStyle: { color: '#ead5db' } },
    },
    series: [
      {
        name: 'Próprio + Transpredi',
        type: 'bar',
        stack: 'total',
        data: resultadoPorEmpresa.map((item) => item.junhoProprio),
        itemStyle: { color: colorProprio },
      },
      {
        name: 'Terceiro',
        type: 'bar',
        stack: 'total',
        data: resultadoPorEmpresa.map((item) => item.junhoTerceiro),
        itemStyle: { color: colorTerceiro },
      },
      {
        name: 'FOB',
        type: 'bar',
        stack: 'total',
        data: resultadoPorEmpresa.map((item) => item.junhoFob),
        itemStyle: { color: colorFob, borderRadius: [0, 8, 8, 0] },
      },
    ],
  };

  return (
    <SlideWrapper
      eyebrow="Resultado"
      title="Resultado consolidado"
      subtitle="Resultado mensal, em percentual, a partir da aba Resultado do Excel."
    >
      <div className="story-page">
        <motion.section className="story-section" {...reveal}>
          <div className="story-section__heading">
            <span className="pill">Resultado</span>
            <h2>Big numbers</h2>
            <p>Principais números da análise de terceiros no grupo.</p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: 18,
            }}
          >
            {/* Meta centralizada */}
            <div
              style={{
                background: `linear-gradient(135deg, ${colorTerceiro}, #a8001d)`,
                color: '#fff',
                borderRadius: 34,
                padding: '34px 28px',
                textAlign: 'center',
                boxShadow: '0 18px 56px rgba(129, 0, 27, 0.16)',
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 950,
                  textTransform: 'uppercase',
                  letterSpacing: '0.14em',
                  opacity: 0.82,
                }}
              >
                Meta de terceiros
              </div>

              <div
                style={{
                  fontSize: 84,
                  fontWeight: 950,
                  letterSpacing: '-0.08em',
                  lineHeight: 0.95,
                  marginTop: 10,
                }}
              >
                {brPercent1.format(meta)}
              </div>

              <div
                style={{
                  marginTop: 12,
                  fontSize: 18,
                  fontWeight: 800,
                  opacity: 0.88,
                }}
              >
                referência para leitura do resultado por empresa
              </div>
            </div>

            {/* Tabela de % de terceiros por empresa */}
            <div
              style={{
                background: '#fff',
                border: `1px solid ${line}`,
                borderRadius: 32,
                padding: 24,
                boxShadow: '0 18px 56px rgba(129, 0, 27, 0.12)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  gap: 20,
                  marginBottom: 18,
                }}
              >
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: 28,
                      letterSpacing: '-0.04em',
                    }}
                  >
                    Resultado atual por empresa
                  </h3>

                  <p
                    style={{
                      margin: '6px 0 0',
                      color: muted,
                      fontWeight: 700,
                    }}
                  >
                    % de terceiros — ordenado do maior para o menor em junho.
                  </p>
                </div>

                <strong
                  style={{
                    color: colorTerceiro,
                    fontSize: 16,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {monthLabel(maio)} → {monthLabel(junho)}
                </strong>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.4fr 0.7fr 0.7fr 0.7fr',
                  gap: 12,
                  padding: '10px 12px',
                  borderRadius: 16,
                  background: soft,
                  color: muted,
                  fontSize: 12,
                  fontWeight: 950,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                <span>Empresa</span>
                <span>Maio</span>
                <span>Junho</span>
                <span>Serviços jun.</span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gap: 8,
                  marginTop: 10,
                }}
              >
                {resultadoPorEmpresa.map((item) => {
                  /**
                   * Se melhorou, maio fica vermelho e junho verde.
                   * Se piorou, junho continua vermelho para chamar atenção.
                   */
                  const maioColor = item.melhorou ? colorTerceiro : muted;
                  const junhoColor = item.melhorou ? green : colorTerceiro;

                  return (
                    <div
                      key={item.company}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1.4fr 0.7fr 0.7fr 0.7fr',
                        gap: 12,
                        alignItems: 'center',
                        padding: '12px 12px',
                        borderRadius: 16,
                        border: `1px solid ${line}`,
                        background: '#fff',
                      }}
                    >
                      <strong
                        style={{
                          color: ink,
                          fontSize: 15,
                        }}
                      >
                        {item.company}
                      </strong>

                      <strong
                        style={{
                          color: maioColor,
                          fontSize: 20,
                          letterSpacing: '-0.04em',
                        }}
                      >
                        {brPercent1.format(item.maioTerceiroShare)}
                      </strong>

                      <strong
                        style={{
                          color: junhoColor,
                          fontSize: 20,
                          letterSpacing: '-0.04em',
                        }}
                      >
                        {brPercent1.format(item.junhoTerceiroShare)}
                      </strong>

                      <span
                        style={{
                          color: muted,
                          fontWeight: 850,
                        }}
                      >
                        {brNumber.format(item.junhoTotal)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cards gerais do grupo */}
            <div className="metric-grid">
              <div className="metric-card">
                <span>Grupo terceiros</span>
                <strong>
                  <span style={{ color: grupoTerceiroMelhorou ? colorTerceiro : muted }}>
                    {brPercent1.format(grupoTerceirosMaio)}
                  </span>
                  <span style={{ color: muted, margin: '0 10px' }}>→</span>
                  <span style={{ color: grupoTerceiroMelhorou ? green : colorTerceiro }}>
                    {brPercent1.format(grupoTerceirosJunho)}
                  </span>
                </strong>
                <small>
                  {brNumber.format(maioTotals.Terceiro)} →{' '}
                  {brNumber.format(junhoTotals.Terceiro)} serviços
                </small>
              </div>

              <div className="metric-card">
                <span>Grupo próprio + Transpredi</span>
                <strong>
                  <span style={{ color: grupoInternoMelhorou ? colorTerceiro : muted }}>
                    {brPercent1.format(grupoInternoMaio)}
                  </span>
                  <span style={{ color: muted, margin: '0 10px' }}>→</span>
                  <span style={{ color: grupoInternoMelhorou ? green : colorTerceiro }}>
                    {brPercent1.format(grupoInternoJunho)}
                  </span>
                </strong>
                <small>aumento da participação interna</small>
              </div>

              <div className="metric-card metric-card--good">
  <span>Redução de terceiros</span>
  <strong>{brPercent1.format(reducaoTerceirosPontos)}</strong>
  <small>
    queda de {pontosPercentuaisFmt(reducaoTerceirosPontos)} no grupo
  </small>
</div>

<div className="metric-card metric-card--good">
  <span>Aumento interno</span>
  <strong>{brPercent1.format(aumentoInternoPontos)}</strong>
  <small>
    ganho de {pontosPercentuaisFmt(aumentoInternoPontos)} com próprio + Transpredi
  </small>
</div>
            </div>
          </div>
        </motion.section>

        <motion.section className="story-section" {...reveal}>
          <div className="story-section__heading">
            <span className="pill">Modalidade</span>
            <h2>Participação por tipo de transporte</h2>
            <p>Próprio + Transpredi avança; terceiros recua no grupo.</p>
          </div>

          <div className="charts-grid charts-grid--two">
            <ChartPanel
              title="Próprio + Transpredi x Terceiro x FOB"
              subtitle="Comparativo percentual entre maio e junho."
              option={optionInternoTerceiroPercentual}
              height={360}
            />

            <ChartPanel
              title="Composição por modalidade"
              subtitle="Frota, Transpredi, Terceiro e FOB, sem duplicar soma interna."
              option={optionComposicaoPercentual}
              height={360}
            />
          </div>
        </motion.section>

        <motion.section className="story-section" {...reveal}>
          <div className="story-section__heading">
            <span className="pill">Ranking</span>
            <h2>Comparativo por empresa</h2>
            <p>Próprio + Transpredi, Terceiro e FOB em percentual e em quantidade de serviços.</p>
          </div>

          <div className="metric-grid metric-grid--3">
            <MetricCard
              label="Mais próximo"
              value={bestCompany?.company ?? '—'}
              helper={bestCompany ? `${brPercent1.format(bestCompany.terceiroShare)} de terceiros` : '—'}
              tone="good"
            />

            <MetricCard
              label="Distância para meta"
              value={bestCompany ? signedPpFmt(bestCompany.terceiroShare - meta) : '—'}
              helper="quanto faltou para 25%"
              tone="alert"
            />

            <MetricCard
              label="Próprio + Transpredi"
              value={bestCompany ? brPercent1.format(bestCompany.proprioShare) : '—'}
              helper="participação interna da empresa"
              tone="good"
            />
          </div>

          <div className="charts-grid charts-grid--two">
            <ChartPanel
              title="Composição por empresa (%)"
              subtitle="Percentual de junho/26: Próprio + Transpredi, Terceiro e FOB."
              option={optionRanking}
              height={430}
            />

            <ChartPanel
              title="Quantidade de serviços por empresa"
              subtitle="Volume de junho/26 por modalidade."
              option={optionRankingQuantidade}
              height={430}
            />
          </div>
        </motion.section>
      </div>
    </SlideWrapper>
  );
}
