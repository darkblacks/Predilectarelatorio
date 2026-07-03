import { motion } from 'framer-motion';
import { ChartPanel } from '../components/ui/ChartPanel';
import { MetricCard } from '../components/ui/MetricCard';
import { SlideWrapper } from '../components/layout/SlideWrapper';
import { MonthlyRow, Transportadora } from '../types';
import {
  brNumber,
  brPercent0,
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
 * Animação padrão das seções.
 */
const reveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.45 },
};

/**
 * Helpers de percentual.
 */
const pct = (value: number) => value * 100;
const pctFmt = (value: number) => `${value.toFixed(1).replace('.', ',')}%`;

/**
 * Cores dos indicadores.
 * Agora o terceiro está aplicado como vermelho em todos os gráficos.
 */
const colorProprio = '#2563eb'; // azul
const colorFrota = '#2563eb'; // azul
const colorTranspredi = '#60a5fa'; // azul claro
const colorTerceiro = '#da0d0d'; // vermelho
const colorCif = '#f59e0b'; // laranja

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
   * Meses da base.
   */
  const [maio = '2026-05', junho = '2026-06'] = getMonthKeys(rows);

  /**
   * Totais gerais por modalidade.
   */
  const maioTotals = transportadoraTotals(rows, maio);
  const junhoTotals = transportadoraTotals(rows, junho);

  const maioTotal = totalByMonth(rows, maio);
  const junhoTotal = totalByMonth(rows, junho);

  /**
   * Interno = Frota própria + Transpredi.
   */
  const maioInterno = maioTotals.Frota + maioTotals.Transpredi;
  const junhoInterno = junhoTotals.Frota + junhoTotals.Transpredi;

  /**
   * Participações gerais do grupo.
   */
  const grupoTerceirosMaio = share(maioTotals.Terceiro, maioTotal);
  const grupoTerceirosJunho = share(junhoTotals.Terceiro, junhoTotal);

  const grupoInternoMaio = share(maioInterno, maioTotal);
  const grupoInternoJunho = share(junhoInterno, junhoTotal);

  /**
   * Na planilha vem como FOB, mas na apresentação aparece como CIF.
   */
  const grupoCifMaio = share(maioTotals.FOB, maioTotal);
  const grupoCifJunho = share(junhoTotals.FOB, junhoTotal);

  /**
   * Ranking base de junho.
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
   * Aliases para evitar problema com pequenas variações de nome.
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

  function aliasKey(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\+/g, '')
      .trim()
      .toLowerCase();
  }

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
    };
  }

  /**
   * Resultado por empresa, ordenado do maior para o menor % de terceiros em junho.
   */
  const resultadoPorEmpresa = companiesForMonth(rows, junho)
    .map((company) => {
      const maioEmpresa = companyTotalsByAlias(maio, company);
      const junhoEmpresa = companyTotalsByAlias(junho, company);

      return {
        company,
        maioTerceiroShare: maioEmpresa.terceiroShare,
        junhoTerceiroShare: junhoEmpresa.terceiroShare,
        maioTotal: maioEmpresa.total,
        junhoTotal: junhoEmpresa.total,
        melhorou: junhoEmpresa.terceiroShare < maioEmpresa.terceiroShare,
      };
    })
    .sort((a, b) => b.junhoTerceiroShare - a.junhoTerceiroShare);

  const grupoTerceiroMelhorou = grupoTerceirosJunho < grupoTerceirosMaio;
  const grupoInternoMelhorou = grupoInternoJunho > grupoInternoMaio;

  const reducaoTerceirosPercentual = share(
    maioTotals.Terceiro - junhoTotals.Terceiro,
    maioTotals.Terceiro
  );

  const aumentoInternoPercentual = share(
    junhoInterno - maioInterno,
    maioInterno
  );

  /**
   * Gráfico 1:
   * Próprio + Transpredi x Terceiro x CIF.
   * Aqui cada indicador é uma série, então cada cor é aplicada corretamente.
   */
  const optionInternoTerceiroPercentual = {
    color: [colorProprio, colorTerceiro, colorCif],
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
        name: 'CIF',
        type: 'bar',
        data: [pct(grupoCifMaio), pct(grupoCifJunho)],
        itemStyle: { color: colorCif, borderRadius: [10, 10, 0, 0] },
      },
    ],
  };

  /**
   * Gráfico 2:
   * Composição por modalidade.
   * Antes ele usava uma cor por mês, então Terceiro não ficava vermelho.
   * Agora cada modalidade é uma série própria, garantindo:
   * Frota azul, Transpredi azul claro, Terceiro vermelho e CIF laranja.
   */
  const optionComposicaoPercentual = {
    color: [colorFrota, colorTranspredi, colorTerceiro, colorCif],
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
        name: 'CIF',
        type: 'bar',
        data: [
          pct(share(maioTotals.FOB, maioTotal)),
          pct(share(junhoTotals.FOB, junhoTotal)),
        ],
        itemStyle: { color: colorCif, borderRadius: [10, 10, 0, 0] },
      },
    ],
  };

  /**
   * Gráfico 3:
   * Ranking por empresa.
   */
  const optionRanking = {
    color: [colorProprio, colorTerceiro],
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
      data: companies.map((item) => item.company),
      axisLine: { lineStyle: { color: '#ead5db' } },
    },
    series: [
      {
        name: 'Próprio + Transpredi',
        type: 'bar',
        data: companies.map((item) => pct(item.proprioShare)),
        itemStyle: { color: colorProprio, borderRadius: [0, 8, 8, 0] },
      },
      {
        name: 'Terceiro',
        type: 'bar',
        data: companies.map((item) => pct(item.terceiroShare)),
        itemStyle: { color: colorTerceiro, borderRadius: [0, 8, 8, 0] },
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
                {brPercent0.format(meta)}
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
                        {brPercent0.format(item.maioTerceiroShare)}
                      </strong>

                      <strong
                        style={{
                          color: junhoColor,
                          fontSize: 20,
                          letterSpacing: '-0.04em',
                        }}
                      >
                        {brPercent0.format(item.junhoTerceiroShare)}
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

            <div className="metric-grid">
              <div className="metric-card">
                <span>Grupo terceiros</span>
                <strong>
                  <span style={{ color: grupoTerceiroMelhorou ? colorTerceiro : muted }}>
                    {brPercent0.format(grupoTerceirosMaio)}
                  </span>
                  <span style={{ color: muted, margin: '0 10px' }}>→</span>
                  <span style={{ color: grupoTerceiroMelhorou ? green : colorTerceiro }}>
                    {brPercent0.format(grupoTerceirosJunho)}
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
                    {brPercent0.format(grupoInternoMaio)}
                  </span>
                  <span style={{ color: muted, margin: '0 10px' }}>→</span>
                  <span style={{ color: grupoInternoMelhorou ? green : colorTerceiro }}>
                    {brPercent0.format(grupoInternoJunho)}
                  </span>
                </strong>
                <small>aumento da participação interna</small>
              </div>

              <div className="metric-card metric-card--good">
                <span>Redução de terceiros</span>
                <strong>{brPercent0.format(reducaoTerceirosPercentual)}</strong>
                <small>
                  {brNumber.format(maioTotals.Terceiro - junhoTotals.Terceiro)} serviços a menos com terceiros no grupo
                </small>
              </div>

              <div className="metric-card metric-card--good">
                <span>Aumento interno</span>
                <strong>{brPercent0.format(aumentoInternoPercentual)}</strong>
                <small>
                  +{brNumber.format(junhoInterno - maioInterno)} serviços com próprio + Transpredi
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
              title="Próprio + Transpredi x Terceiro x CIF"
              subtitle="Comparativo percentual entre maio e junho."
              option={optionInternoTerceiroPercentual}
              height={360}
            />

            <ChartPanel
              title="Composição por modalidade"
              subtitle="Frota, Transpredi, Terceiro e CIF, sem duplicar soma interna."
              option={optionComposicaoPercentual}
              height={360}
            />
          </div>
        </motion.section>

        <motion.section className="story-section" {...reveal}>
          <div className="story-section__heading">
            <span className="pill">Ranking</span>
            <h2>Quem ficou mais próximo da meta?</h2>
            <p>Ranking de junho ordenado da menor para a maior participação de terceiros.</p>
          </div>

          <div className="metric-grid metric-grid--3">
            <MetricCard
              label="Mais próximo"
              value={bestCompany?.company ?? '—'}
              helper={bestCompany ? `${brPercent0.format(bestCompany.terceiroShare)} de terceiros` : '—'}
              tone="good"
            />

            <MetricCard
              label="Distância para meta"
              value={bestCompany ? `${((bestCompany.terceiroShare - meta) * 100).toFixed(0).replace('.', ',')} p.p.` : '—'}
              helper="quanto faltou para 25%"
              tone="alert"
            />

            <MetricCard
              label="Próprio + Transpredi"
              value={bestCompany ? brPercent0.format(bestCompany.proprioShare) : '—'}
              helper="participação interna da empresa"
              tone="good"
            />
          </div>

          <ChartPanel
            title="Ranking de Próprio + Transpredi e Terceiro"
            subtitle="Percentual por empresa em junho/26."
            option={optionRanking}
            height={430}
          />
        </motion.section>
      </div>
    </SlideWrapper>
  );
}