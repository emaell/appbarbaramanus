# Relatório — Lapidação final do app Cuidar com Dra. Bárbara

## Arquivos alterados/preparados

- `package.json`
- `shared/constants.ts`
- `client/src/pages/Today.tsx`
- `client/src/pages/Growth.tsx`
- `client/src/pages/Diary.tsx`
- `client/src/pages/Content.tsx`
- `client/src/pages/Profile.tsx`

## Bugs corrigidos

- Corrigida diagramação do hero da Home para evitar corte no rosto da Dra. Bárbara.
- Corrigido WhatsApp para `+55 94 8196-4587`.
- Corrigidos atalhos da Home para a aba correta de fraldas.
- Corrigido botão de vacina para registrar/editar aplicação localmente.
- Corrigida exportação da curva de crescimento: JSON deixou de ser ação principal, substituída por copiar resumo e imprimir/salvar PDF.
- Corrigido botão de preparação de consulta de saúde digestiva.
- Corrigido tipo do sintoma “vômito” para compatibilidade com os tipos existentes.
- Removido uso de `NODE_ENV=...` nos scripts principais para evitar erro no Windows PowerShell.

## Funcionalidades novas ou lapidadas

- Home com resumo mais real: medida, sono, sintoma, saúde digestiva, vacina e resumo para consulta.
- Crescimento com IMC estimado, edição, exclusão, resumo copiável, impressão/PDF e CTA para WhatsApp.
- Diário com registros de leite ordenhado, fórmula/complemento, duração de sintomas e alertas educativos.
- Gastro com formulário completo, preparações salvas e resumo copiável.
- Conteúdos com destaque por idade da criança ativa.
- Perfil com campos adicionais de responsável, cidade e UF.
- Vacinas com data aplicada, local e observações.

## Pendências restantes

- Validar no celular real todos os fluxos críticos.
- Confirmar se `client/public/assets/videos/anemia-sbp.mp4` e `reportagem-babau.mp4` existem no projeto final.
- Confirmar se `client/public/assets/pdfs/janelas-de-sono-do-bebe.pdf` existe no projeto final.
- Validar textos médicos com a Dra. Bárbara.
- Validar autorização expressa para fotos com crianças/famílias.
- Percentis e z-score OMS não foram implementados porque as tabelas oficiais não estão incluídas e validadas no projeto.

## Comandos para testar

```bash
pnpm install
pnpm dev
```

Depois testar no navegador em `http://localhost:3000/`.

## Comandos para build

```bash
pnpm check
pnpm test
pnpm build:client
```

## Deploy no Netlify

- Build command: `pnpm build:client`
- Publish directory: `dist/public`

Não usar `db:push` no Netlify para este MVP estático/client-side.

## Validação médica/jurídica

- O app é educativo e não substitui consulta médica.
- Fotos de crianças/famílias exigem autorização expressa.
- Textos de saúde devem ser validados pela pediatra.
- Dados infantis ficam locais no MVP e o usuário deve poder apagá-los.

## Itens intencionalmente não implementados

- Percentis e z-score OMS: adiados até inclusão e validação das tabelas oficiais.
- Diagnóstico automático: não implementado por segurança médica.
- Notificações invasivas de mamada: não implementadas para evitar excesso de alertas.
