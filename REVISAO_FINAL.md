# Revisão final — Cuidar com Dra. Bárbara

## Atualizações desta versão

- `shared/constants.ts` atualizado com o vídeo `anemia-sbp.mp4` em `/assets/videos/anemia-sbp.mp4`.
- Links do Google atualizados:
  - Empresa/Maps: `https://share.google/g6XjX1wQQWrooyU6H`
  - Avaliações/Avaliar: `https://share.google/wvSIFxvInvfh2XGTK`
- Botão “Avaliar” da Home corrigido para usar `CONTACT.googleReviewWriteUrl`.
- Documentação atualizada para orientar conferência do arquivo `anemia-sbp.mp4` antes do deploy.

## Conferência importante

Este pacote foi preparado com referência ao arquivo real `anemia-sbp.mp4`. Se o arquivo não estiver dentro de `client/public/assets/videos/` no pacote final, adicione-o antes do deploy.

Caminhos esperados:

```text
client/public/assets/videos/anemia-sbp.mp4
client/public/assets/videos/reportagem-babau.mp4
```

## Deploy Netlify

```text
Build command: pnpm build:client
Publish directory: dist/public
```

## Observação

Não foram inseridas avaliações fictícias. O app aponta para o link real de avaliações informado pelo cliente.
