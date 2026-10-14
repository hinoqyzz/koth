# Koth

Site editorial da Koth — fase 1: preloader, navbar e hero.

```bash
npm install
npm run dev
```

Build de produção:

```bash
npm run build
npm run preview
```

A imagem do hero sai de `src/assets/img/raw/hero-bg.jpg`. Sem esse arquivo, o hero usa o placeholder em degradê. `npm run optimize` gera AVIF, WebP, JPG e o LQIP.

`?preloader=full` força a montagem completa do K na mesma sessão.
