# Deploy no Netlify — Cuidar com Dra. Bárbara

## Configuração recomendada

Build command:

```bash
pnpm build:client
```

Publish directory:

```txt
dist/public
```

## Passo a passo

1. Extraia este ZIP.
2. Abra a pasta no VS Code.
3. Rode:

```bash
pnpm install
pnpm check
pnpm build:client
```

4. Suba para um repositório no GitHub.
5. No Netlify, escolha **Add new project** > **Import an existing project**.
6. Selecione o repositório.
7. Confirme:

```txt
Build command: pnpm build:client
Publish directory: dist/public
```

8. Clique em **Deploy**.

## Deploy manual

Depois de rodar:

```bash
pnpm build:client
```

arraste a pasta abaixo para o deploy manual do Netlify:

```txt
dist/public
```

## Assets integrados

- Fotos reais em `client/public/assets/images/`.
- PDFs em `client/public/assets/pdfs/`.
- Thumbnails em `client/public/assets/thumbs/`.
- Vídeos reais esperados em `client/public/assets/videos/`: `reportagem-babau.mp4` e `anemia-sbp.mp4`.

## Pendência de vídeo

O app está configurado para usar `anemia-sbp.mp4`. Antes do deploy, confirme que o arquivo real existe em:

1. Coloque o arquivo em:

```txt
client/public/assets/videos/anemia-sbp.mp4
```

2. Abra `shared/constants.ts`.
3. No item `anemia-sbp`, altere:

```ts
videoUrl: '/assets/videos/anemia-sbp.mp4'
```

para:

```ts
videoUrl: '/assets/videos/anemia-sbp.mp4'
```
