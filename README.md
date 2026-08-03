# Predilecta — apresentação operacional dinâmica

Versão do projeto **Predilectarelatorio** preparada para trocar o mês e a planilha sem refazer os slides.
A identidade visual, a logo, a estrutura em páginas, o ECharts e o Framer Motion foram preservados.

## Como abrir

### Windows

1. Extraia o ZIP.
2. Execute `INICIAR.bat`.
3. Aguarde a instalação das dependências na primeira abertura.
4. Abra o endereço mostrado pelo Vite, normalmente `http://localhost:5173`.

### Terminal

```bash
npm install
npm run dev
```

## Como trocar o mês

O seletor **Mês**, no menu superior, é preenchido automaticamente com todos os meses encontrados na aba `Resultado`.
O mês mais recente é selecionado ao abrir a apresentação. A comparação é feita com o mês anterior disponível na mesma planilha.

## Como trocar os dados

Há duas formas:

1. **Teste local e imediato:** clique no botão com ícone de upload no menu e escolha outro arquivo `.xlsx` ou `.xls`. A troca dura até atualizar a página.
2. **Troca permanente para GitHub/Netlify:** substitua o arquivo:

```text
public/data/predilecta_banco_dados_com_caminhoes.xlsx
```

Depois faça o commit e o deploy normalmente.

## Padrão da planilha

A apresentação utiliza as abas:

### Resultado

| Mês | Transportadora | Cliente | QTD de transportes |
|---|---|---|---:|

Modalidades reconhecidas: `Frota`, `Transpredi`, `Terceiro` e `FOB`.

### Evolução

| Data | Transportadora | Cliente | QTD de transportes |
|---|---|---|---:|

A página de evolução filtra automaticamente o mês selecionado e reinicia o acumulado a cada mês.

### Caminhoes

A estrutura original foi mantida e continua sendo lida pelo projeto.

## Meta e regra do indicador

A meta de participação de terceiros está configurada em **25%** no arquivo:

```text
src/hooks/useWorkbookData.ts
```

Constante:

```ts
const META_TERCEIROS = 0.25;
```

O indicador é calculado como **Terceiros / (Frota + Terceiros)**. O FOB é exibido separadamente e não entra no percentual.

A classificação da Transpredi muda por período:

- Até junho/2026: Transpredi compõe **Frota**.
- A partir de julho/2026: Transpredi compõe **Terceiros**.

A regra está centralizada em `src/utils/metrics.ts`, na constante:

```ts
export const TRANSPREDI_EM_TERCEIROS_DESDE = '2026-07';
```

## Resultado de julho de 2026

- Total geral: **2.457 carregamentos**
- Frota: **1.344**
- Transpredi: **187**
- Terceiros informados na planilha: **798**
- Terceiros para o indicador: **985** (`798 + 187`)
- Base operacional Frota + Terceiros: **2.329**
- FOB fora do indicador: **128**
- Participação de terceiros: **42,3%**
- Participação da frota: **57,7%**
- Meta: **25,0%**
- Distância da meta: **17,3 pontos percentuais acima**
- Junho/2026: **40,5%** de terceiros pela regra vigente naquele mês
- Evolução: **piora de 1,8 ponto percentual** em julho
- Conversão necessária para atingir 25%, mantendo a base: **403 carregamentos** de terceiros para frota

Conclusão: **julho ficou acima da meta e piorou em relação a junho após a classificação correta da Transpredi**.

## Netlify

O projeto mantém o build padrão:

```bash
npm run build
```

Diretório publicado:

```text
dist
```

O `netlify.toml` também desativa o cache do XLSX para evitar que uma planilha antiga continue aparecendo após o deploy.
