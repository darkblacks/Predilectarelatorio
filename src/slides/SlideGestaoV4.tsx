import { motion } from 'framer-motion';
import ReactECharts from 'echarts-for-react';
import { SlideWrapper } from '../components/layout/SlideWrapper';
import type { MonthSummary } from './useProductivityWorkbook';

const C = { red: '#da0d0d', blue: '#2563eb', orange: '#f59e0b', ink: '#2e1a20', muted: '#7c6570', line: '#f1dce2', green: '#188456' };
const dinheiro = (v: number) => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v);
const decimal = (v: number) => v.toFixed(2).replace('.',',');
const card: React.CSSProperties = { background:'#fff', padding:24, borderRadius:28, border:`1px solid ${C.line}`,boxShadow:'0 14px 42px rgba(129,0,27,.07)' };
function Reveal({children,delay=0}:{children:React.ReactNode;delay?:number}) {return <motion.div initial={{opacity:0,y:25}} animate={{opacity:1,y:0}} transition={{duration:.45,delay}} style={card}>{children}</motion.div>}
function Metric({title,value,detail,color=C.blue}:{title:string;value:string;detail:string;color?:string}) {return <div><div style={{fontSize:13,fontWeight:900,color,letterSpacing:'.09em',textTransform:'uppercase'}}>{title}</div><div style={{fontSize:'clamp(26px,3vw,44px)',fontWeight:950,color:C.ink,marginTop:12}}>{value}</div><div style={{fontSize:14,color:C.muted,marginTop:8,lineHeight:1.5}}>{detail}</div></div>}
const fonte = 'Fonte: Gestão Logística Mai–Ago 2026 · dados históricos da planilha';
const chartStyle = {height:320,width:'100%'};
export function SlideGestaoHistorica(){
 const labels=['Mai','Jun','Jul','Ago'];const viagens=[8.05,9.30,10.27,10.68];const custo=[5.24,5.14,4.71,5.05];
 return <SlideWrapper eyebrow="Visão Gerencial / V4" title="Mais viagens por veículo. E o custo?" subtitle="De maio a agosto, a produtividade cresce; em agosto, o custo por km volta a subir." footer={fonte}>
 <div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:16}}>
 <Reveal><Metric title="Viagens por veículo · maio" value="8,05" detail="Ponto de partida da série" /></Reveal>
 <Reveal delay={.08}><Metric title="Viagens por veículo · agosto" value="10,68" detail="Crescimento de 32,7% sobre maio" color={C.green}/></Reveal>
 <Reveal delay={.16}><Metric title="Custo / km · agosto" value="R$ 5,05" detail="Acima dos R$ 4,71 registrados em julho" color={C.orange}/></Reveal>
 </div><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginTop:16}}>
 <Reveal delay={.2}><h3>Produtividade mensal</h3><ReactECharts style={chartStyle} option={{tooltip:{trigger:'axis'},grid:{left:46,right:20,bottom:34},xAxis:{type:'category',data:labels},yAxis:{type:'value',min:0},series:[{type:'bar',data:viagens,itemStyle:{color:C.blue,borderRadius:[8,8,0,0]},label:{show:true,position:'top',formatter:({value}:any)=>decimal(Number(value))}}]}}/></Reveal>
 <Reveal delay={.28}><h3>Custo da frota por km</h3><ReactECharts style={chartStyle} option={{tooltip:{trigger:'axis'},grid:{left:48,right:20,bottom:34},xAxis:{type:'category',data:labels},yAxis:{type:'value',min:0},series:[{type:'line',data:custo,smooth:true,symbolSize:12,itemStyle:{color:C.red},label:{show:true,position:'top',formatter:({value}:any)=>dinheiro(Number(value))}}]}}/></Reveal>
 </div></SlideWrapper>
}
export function SlideCustos(){return <SlideWrapper eyebrow="Análise de Eficiência / V4" title="Produtividade não é sinônimo de menor custo" subtitle="Um olhar complementar sobre utilização dos ativos, custo por km e impacto do apoio externo." footer={fonte}>
 <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
 <Reveal><Metric title="Custo / km · julho" value="R$ 4,71" detail="Menor custo/km entre os quatro meses apresentados" color={C.green}/></Reveal>
 <Reveal delay={.09}><Metric title="Custo / km · agosto" value="R$ 5,05" detail="Variação de +7,2% na comparação mensal" color={C.red}/></Reveal>
 </div>
 <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:18,marginTop:18}}>
 {[["01","Eficiência física","Viagens por veículo, disponibilidade, ocupação e retorno vazio"],["02","Eficiência financeira","Custo da frota por km e frete externo como % do faturamento"],["03","Custo evitável","Mensurar apenas terceiros classificados como evitáveis, com custo informado"]].map(([n,t,d],i)=><Reveal delay={i*.08} key={n}><span style={{color:C.orange,fontWeight:950}}>{n}</span><h2 style={{color:C.ink}}>{t}</h2><p style={{color:C.muted,lineHeight:1.6}}>{d}</p></Reveal>)}
 </div><p style={{color:C.muted,fontWeight:700,marginTop:24}}>Nota de integridade: os custos de setembro dependem de lançamentos financeiros adicionais; não foram estimados a partir de volume de viagens.</p></SlideWrapper>}
export function SlidePlanejamento(){return <SlideWrapper eyebrow="Operação / V4" title="Da análise posterior à prevenção" subtitle="O controle diário propõe antecipar lacunas de capacidade antes do início da expedição." footer="Fonte: Gestão Logística Mai–Ago 2026 · aba Controle Diário">
 <div style={{display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:16}}>{[
 ['1 · Antes das 8h','Prever a demanda','Cargas e peso previstos por fábrica'],
 ['2 · Disponibilidade','Avaliar os ativos','Veículos disponíveis, parados e capacidade estimada'],
 ['3 · Risco','Calcular o GAP','Diferença entre a capacidade prevista e a demanda'],
 ['4 · Ação','Agir antecipadamente','Redistribuir escala, roteirização ou apoio externo']].map(([n,t,d],i)=><Reveal delay={i*.1} key={n}><span style={{color:C.red,fontSize:13,fontWeight:900}}>{n}</span><h2 style={{color:C.ink,minHeight:60}}>{t}</h2><p style={{color:C.muted,lineHeight:1.65}}>{d}</p></Reveal>)}</div>
 <Reveal delay={.4}><h2 style={{color:C.ink}}>O que muda na gestão?</h2><p style={{color:C.muted,fontSize:18,lineHeight:1.7}}>Em vez de apenas justificar o terceiro depois da contratação, a equipe visualiza o risco previamente e registra a decisão tomada. A planilha contém a estrutura para isso, mas a apresentação não presume que todos os dias já foram preenchidos.</p></Reveal></SlideWrapper>}
export function SlideTerceirizacao({current}:{current:MonthSummary}){const base=current.own+current.thirdParty;const share=base?100*current.thirdParty/base:0;return <SlideWrapper eyebrow="Apoio Externo / V4" title="Terceirização: volume, causa e evitabilidade" subtitle="Separar a participação de terceiros de suas razões operacionais, sem confundir volume com desperdício." footer="Fonte: Controle Aproveitamento Frota Setembro/2026 + Gestão Logística Mai–Ago 2026">
 <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:18}}><Reveal><Metric title="Terceiros · setembro" value={current.thirdParty.toLocaleString('pt-BR')} detail="Transpredi contratado + terceiros" color={C.red}/></Reveal><Reveal delay={.08}><Metric title="Participação de terceiros" value={`${decimal(share)}%`} detail="Denominador exclui FOB" color={C.orange}/></Reveal><Reveal delay={.16}><Metric title="Custo evitável" value="A apurar" detail="Exige motivo, classificação e custo de cada contratação" color={C.blue}/></Reveal></div>
 <Reveal delay={.25}><h2 style={{color:C.ink}}>O que precisa ser registrado em cada contratação?</h2><div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:15}}>{[
 ['Motivo','Demanda não prevista, manutenção, escala ou janela de cliente'],['Evitabilidade','Evitável, parcialmente evitável ou não evitável'],['Impacto','Custo efetivo do frete para priorizar ações corretivas']].map(([a,b])=><div key={a} style={{padding:18,background:'#fff5f7',borderRadius:16}}><strong style={{color:C.red}}>{a}</strong><p style={{color:C.muted,lineHeight:1.5}}>{b}</p></div>)}</div></Reveal>
 <p style={{color:C.muted,marginTop:14}}>Regra preservada: próprio = Frota + Transpredi; terceiros = Transpredi contratado + Terceiros; FOB fora da proporção.</p></SlideWrapper>}
