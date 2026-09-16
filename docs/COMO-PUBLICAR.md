---
nav_order: 99
title: Como publicar isto
parent: Interno
---

# Publicar e manter esta documentação

Markdown simples, servido como site estático. Sem build, sem Actions.

## Publicar no GitHub Pages

1. **Settings → Pages**
2. *Build and deployment* → **Source: Deploy from a branch**
3. **Branch:** `main` · **Folder:** `/docs`
4. Guardar → fica em `https://igrejaondaporto.github.io/gd-management/`

A partir daí, alterações a estes ficheiros publicam-se sozinhas quando entram na `main`.

O tema é o [just-the-docs](https://just-the-docs.com/), declarado em `_config.yml`. Dá a barra
lateral com a ordem das páginas (cada página tem um `nav_order` no cabeçalho) e pesquisa.

### Duas armadilhas que já custaram uma publicação

Nenhuma das duas dá erro. O site publica-se, só fica incompleto.

1. **Ficheiro começado por `_` não é publicado.** O Jekyll reserva esse prefixo e ignora o ficheiro
   por completo — não há aviso no build. A página pai dos supervisores chamava-se
   `_supervisores.md`; como o pai desaparecia, os quatro filhos (`painel`, `saude-do-gd`,
   `gerir-gds`, `gerir-usuarios`) ficaram órfãos e **sumiram da barra lateral**, apesar de os
   ficheiros estarem lá. Se uma secção inteira desaparecer do menu, é isto.

2. **`exclude:` no `_config.yml` também apaga imagens.** Estava lá `imagens/`, e as 12 capturas
   ficaram em 404 com as páginas a apontar para elas. O `exclude` serve só para o que não é para
   publicar (`COMO-PUBLICAR.md`, este ficheiro). Se uma imagem nova não aparecer, é o primeiro
   sítio a olhar.

## Ver localmente

```bash
pnpm docs:serve
```

## Capturas de ecrã

As imagens de `imagens/` **já estão no repositório** — não é preciso gerar nada para publicar o site.

Para as substituir, usa **capturas do telemóvel**. É uma aplicação mobile-first, por isso ficam
melhores do que qualquer emulação. Guarda com os nomes já usados nesta pasta (por exemplo
`seus-grupos.png`) e as páginas apanham-nas sozinhas.

**Usa sempre dados de exemplo.** O repositório é público e as capturas não podem mostrar nomes de
pessoas reais.

Não há script para isto no repositório — as imagens foram geradas uma vez com ferramenta local, que
não foi incluída para não trazer dependências só por causa de imagens.

**Se mudares um ecrã, atualiza as imagens.** Faz parte da alteração, não é um extra.

## Manter isto atualizado

A documentação faz parte do trabalho. Quando mudares um ecrã — um nome, um botão, um fluxo — atualiza
a página correspondente **no mesmo PR**.

Já aconteceu o README deste repositório ficar meses a dizer que os supervisores só tinham leitura,
quando têm escrita desde a migração 006. A documentação ao lado do código não fica imune a isto;
fica só mais fácil de reparar.
