# Comparativo técnico e melhorias aplicadas

## Versões analisadas

1. `chat cuidar-dra-barbara-netlify-melhorado.zip`
   - Melhor base técnica.
   - Projeto React + TypeScript + Vite + Tailwind.
   - Já possui estrutura de app/PWA, persistência local, páginas completas e configuração Netlify.

2. `chat dra_barbara_app_v1.zip`
   - Melhor como fonte de assets e referência visual simples.
   - Estrutura pequena em React/JS/CSS.
   - Incluía o vídeo real `reportagem-babau.mp4`.
   - Não era a melhor base para evolução por ter arquitetura menos modular.

3. `chat cuidar-com-dra-barbara-netlify-dist(2).zip`
   - É apenas uma build estática pronta para deploy.
   - Útil como referência de saída final, mas não como base de edição.

## Base escolhida

A base escolhida foi `chat cuidar-dra-barbara-netlify-melhorado.zip`, porque é a versão mais completa, com componentes reutilizáveis, rotas, dados tipados, PWA, assets organizados e configuração para Netlify.

## Melhorias aplicadas nesta versão

- Integração real do vídeo `reportagem-babau.mp4` em `client/public/assets/videos/reportagem-babau.mp4`.
- Atualização do card de vídeo para abrir o MP4 real dentro do app.
- Ativação do card `anemia-sbp` apontando para `/assets/videos/anemia-sbp.mp4`.
- Atualização dos PDFs enviados para nomes limpos dentro de `client/public/assets/pdfs/`.
- Atualização das fotos reais dentro de `client/public/assets/images/`.
- Correção dos ícones PWA e aliases `icon-192.png` e `icon-512.png`.
- Correção do `manifest.json`, que antes apontava para ícones inexistentes.
- Correção do `sw.js`, que antes cacheava `/icon-192.png` e `/icon-512.png` de forma inconsistente.
- Melhoria de SEO no `client/index.html`:
  - `lang="pt-BR"`;
  - title mais descritivo;
  - meta description;
  - Open Graph;
  - Twitter Card;
  - ícones corretos;
  - remoção de script de analytics com placeholders quebrados.
- Separação mais clara entre botão de ver avaliações e botão de avaliar no Google.
- Criação deste relatório para facilitar auditoria.

## Pendências antes de produção

- Confirmar que o vídeo real `anemia-sbp.mp4` está em `client/public/assets/videos/anemia-sbp.mp4` antes do deploy.
- Confirmar se todas as fotos de pacientes/crianças possuem autorização expressa dos responsáveis.
- Substituir o link genérico de avaliação do Google pelo link direto real do Perfil da Empresa no Google.
- Revisar textos médicos finais com a Dra. Bárbara antes de divulgar publicamente.
- Rodar localmente:

```bash
pnpm install
pnpm check
pnpm build:client
```

## Deploy Netlify

Configuração esperada:

```txt
Build command: pnpm build:client
Publish directory: dist/public
```
