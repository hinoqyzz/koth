# Koth — wireframe compositivo

Protótipo navegável da primeira dobra do site da Koth. É um wireframe editorial em tons neutros, para avaliar estrutura, hierarquia e enquadramento. A paleta oficial, o 3D definitivo e o restante do site ficam para depois da aprovação.

## Executar

```bash
npm install
npm run dev
```

O Vite sobe em `http://localhost:5173`.

```bash
npm run build
npm run preview
```

## O que revisar

- Navbar, hero e o recorte da seção seguinte.
- Três variações de texto, no painel **Revisão**.
- Grade de 12 colunas (4 no mobile) e anotações estruturais.
- Enquadramentos: 1440×900, 1920×1080, 1366×768, 768×1024, 390×844 e 375×812.
- Storyboard do preloader Assemble / Koth, com uma demonstração esquemática.

Atalhos: `1` `2` `3` trocam o texto, `G` liga a grade, `N` liga as anotações, `Esc` fecha os painéis.

Serviços, Projetos, Sobre e o contato são navegação provisória. Ainda não existem páginas para esses destinos.

A navbar usa o arquivo oficial `koth_logo_paper.svg`. As fontes são as versões variáveis do kit, porque os arquivos estáticos exportados estavam todos no peso mais leve.
