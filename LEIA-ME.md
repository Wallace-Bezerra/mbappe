# Kylian Mbappé — hero com efeito de revelação no mouse

Site de uma página (Vite + React + Tailwind) que reaproveita o efeito do
**pureflow-one**: um holofote segue o mouse e **revela uma segunda imagem**
por baixo da primeira.

- **Base** (Mbappé normal, camisa da França): `public/mbappe-base.webp`
- **Revelação** (Mbappé "general", aparece sob o mouse): `public/mbappe-reveal.webp`

## 👉 Trocar pelas suas fotos (2 arquivos)
As imagens que estão em `public/` agora são **placeholders temporários**.
Basta substituir os dois arquivos, mantendo os mesmos nomes:

1. Salve a foto do **Mbappé com a camisa da França** como
   `public/mbappe-base.webp`
2. Salve a foto do **Mbappé "general"** como
   `public/mbappe-reveal.webp`

> Pode ser JPG/PNG renomeado para `.webp` — o navegador reconhece pelo conteúdo.
> Ideal: as duas fotos no **mesmo enquadramento** (mesma pose/posição do rosto),
> assim a revelação fica perfeitamente encaixada.

Se preferir outros nomes/extensões, ajuste as constantes `BASE_IMAGE` e
`REVEAL_IMAGE` no topo de `src/App.tsx`.

## Rodar
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # produção
```

## Observações
- O efeito é do **mouse** (desktop). No celular não há cursor, então aparece só
  a imagem base — comportamento esperado.
- Parâmetros do holofote: `SPOTLIGHT_R` (raio) e `GRID_CELL` (grade) no topo de `src/App.tsx`.
