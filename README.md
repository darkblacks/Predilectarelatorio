# Dashboard Predilecta

Apresentação web em React/Vite com 4 páginas:

1. Apresentação
2. Resultado
3. Evolução
4. Agradecimento

## Dados

O dashboard lê o arquivo:

`public/data/predilecta_banco_dados_frota.xlsx`

Abas do arquivo:

- `Resultado`: base mensal de Maio/26 e Junho/26.
- `Evolução`: base diária de Junho/26.
- `Frota`: cadastro de frota/caminhões informado.

Na aba `Frota`, a coluna `Conta como caminhão` é usada para a análise de capacidade. Valor `1` entra no cálculo de frota disponível; valor `0` fica cadastrado, mas não entra no cálculo.

## Rodar localmente

```cmd
npm config set registry https://registry.npmjs.org/
npm install
npm run dev
```

## Build

```cmd
npm run build
```
