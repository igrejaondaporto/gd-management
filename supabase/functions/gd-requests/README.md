# Integração — pedidos de GD

Endpoint para sistemas externos criarem e lerem pedidos para entrar num GD
("Quero entrar num GD"). O Portal do Voluntário é o primeiro parceiro; outros
podem ser adicionados sem alterar código (ver [Adicionar um parceiro](#adicionar-um-parceiro)).

> Este documento é para quem integra. A documentação em `docs/` é o guia de
> utilização da aplicação — não se misturam.

## Base

```
https://waeopvgoeadyrplrfuzk.supabase.co/functions/v1/gd-requests
```

Nunca chames a base de dados directamente. As funções por trás deste endpoint
(`submit_gd_request`, `gd_request_statuses`) só podem ser executadas pelo
serviço interno.

## Credenciais

Recebes **uma chave** (uma string longa). Envia-a em todas as chamadas no
cabeçalho `x-api-key`:

```
x-api-key: <a-tua-chave>
```

Não há tokens nem renovação: a chave é fixa e serve até ser rodada do nosso lado.

> Nunca uses uma *secret key* do projecto Supabase. Essa chave dá acesso total à
> base de dados e ignora todas as regras de segurança — este endpoint existe
> precisamente para não precisares dela.

## Obrigatório: só a partir do servidor

A chave **é** a identidade do parceiro. Quem a tiver pode criar e ler pedidos em
nome do parceiro — por isso ela nunca pode chegar ao browser, à app, a uma
extensão ou a qualquer código que o utilizador final consiga ler.

```
❌  Browser / app  ──(chave)──>  /functions/v1/gd-requests
✅  Browser / app  ──>  Cloud Function (guarda a chave)  ──>  /functions/v1/gd-requests
```

O endpoint tem CORS aberto e não valida a origem do pedido: se a chave entrar
num bundle de cliente, qualquer pessoa a copia e passa a escrever como o
parceiro. A chamada tem de ser feita **server to server** — Cloud Functions,
servidor, cron, job — e a chave tem de viver no gestor de segredos descrito
abaixo.

### Guardar a chave num gestor de segredos

A chave vive no *secret manager* do serviço, nunca em código, nunca no
repositório, e nunca num sítio que o cliente possa ler — **incluindo o
Firestore**: um documento com regras permissivas é tão exposto como um ficheiro
no bundle.

Exemplo com Firebase Functions (v2), já que é o caso do Portal:

```ts
import { defineSecret } from "firebase-functions/params";
import { onRequest } from "firebase-functions/v2/https";

const GD_API_KEY = defineSecret("GD_API_KEY");

export const pedidoGd = onRequest({ secrets: [GD_API_KEY] }, async (req, res) => {
  const resposta = await fetch(
    "https://waeopvgoeadyrplrfuzk.supabase.co/functions/v1/gd-requests",
    {
      method: "POST",
      headers: {
        "x-api-key": GD_API_KEY.value(),
        "content-type": "application/json",
      },
      body: JSON.stringify({ ref: "membro-123", name: "Maria Silva", region: "norte" }),
    },
  );
  res.status(resposta.status).json(await resposta.json());
});
```

```bash
firebase functions:secrets:set GD_API_KEY   # cola a chave quando for pedida
```

Noutras plataformas é o equivalente: Google Cloud Secret Manager, AWS Secrets
Manager, variáveis de ambiente do serviço, etc. Desde que fique **só** no
servidor, está bem; se alguma vez chegar ao cliente, não está.

### Checklist

- [ ] A chave só existe no servidor (secret manager ou variável de ambiente do serviço).
- [ ] Nenhum bundle de cliente a contém — procura por `x-api-key` no build final.
- [ ] Não a escreves em logs, mensagens de erro nem telemetria.
- [ ] Se suspeitares de fuga, pedes a rotação: a chave antiga morre no momento, sem esperar por expiração.

## Permissões

A chave traz as permissões (`scopes`) do parceiro. Pedir algo sem a permissão
correspondente devolve `403`.

| Scope               | Permite              |
| ------------------- | -------------------- |
| `gd_requests:read`  | `GET` (ler estados)  |
| `gd_requests:write` | `POST` (criar pedido) |

## `POST` — criar ou actualizar um pedido

Corpo JSON:

| Campo           | Obrigatório | Notas                                             |
| --------------- | ----------- | ------------------------------------------------- |
| `ref`           | sim         | Identificador **no teu sistema** (≤ 120 caracteres) |
| `name`          | sim         | Nome da pessoa (≥ 2 caracteres)                   |
| `phone`         | não         |                                                   |
| `email`         | não         |                                                   |
| `concelho`      | não         |                                                   |
| `age`           | não         | 0–120                                             |
| `maritalStatus` | não         |                                                   |
| `notes`         | não         | ≤ 600 caracteres                                  |
| `region`        | não         |                                                   |
| `hasChildren`   | não         | `true` / `false`                                  |
| `childrenNote`  | não         | Idades, ex.: `"2 e 5 anos"` (≤ 120 caracteres)    |

```bash
curl -sS -X POST "$BASE" \
  -H "x-api-key: $KEY" -H "content-type: application/json" \
  -d '{"ref":"membro-123","name":"Maria Silva","phone":"+351910000000","region":"norte"}'
```

```json
{ "id": "5f0c…", "status": "new" }
```

**Idempotência.** O mesmo `ref` é sempre o mesmo pedido: os dados de contacto são
actualizados, mas o encaminhamento (GD atribuído, estado, quem já contactou)
**nunca** é desfeito por um reenvio. Podes reenviar à vontade.

## `GET` — ler o estado dos pedidos

```
GET $BASE?refs=membro-123,membro-124
GET $BASE                      # sem `refs`: os teus últimos 1000 pedidos
```

- `refs` — lista separada por vírgulas (máximo 1000).
- Só devolve **os pedidos do próprio parceiro**. Nunca vês pedidos de outro.

```json
{
  "requests": [
    {
      "ref": "membro-123",
      "status": "assigned",
      "gdName": "GD Cedofeita",
      "statusByName": "Ana",
      "updatedAt": "2026-10-09T18:22:31.114Z"
    }
  ]
}
```

Estados possíveis (`status`):

| Estado      | Significado                          |
| ----------- | ------------------------------------ |
| `new`       | Recebido, ainda sem ninguém a tratar |
| `claimed`   | Um supervisor está a tratar          |
| `assigned`  | Encaminhado para um GD               |
| `contacted` | A pessoa já foi contactada           |
| `joined`    | Entrou no GD                         |
| `declined`  | Não avançou                          |

## Erros

| Código | `error`              | Quando                                        |
| ------ | -------------------- | --------------------------------------------- |
| `400`  | `invalid_request`    | Corpo inválido (ex.: falta `ref` ou `name`)   |
| `401`  | `unauthorized`       | Chave ausente ou desconhecida                 |
| `403`  | `forbidden`          | Falta o scope necessário                      |
| `405`  | `method_not_allowed` | Método diferente de `GET`/`POST`              |
| `500`  | `internal_error`     | Erro do nosso lado                            |

## Adicionar um parceiro

Do lado de cá (não precisas de fazer nada). Cada parceiro é um *secret* da Edge
Function, que passa a valer de imediato — sem redeploy:

```bash
KEY=$(openssl rand -hex 32)

supabase secrets set PARTNER_PORTAL_ONDA="{\"source\":\"portal-onda\",\"key\":\"$KEY\",\"scopes\":[\"gd_requests:read\",\"gd_requests:write\"]}"
```

A chave — o valor de `key` — é o que entregas ao parceiro. Rodar a chave é
repetir o comando com uma chave nova; retirar o acesso é remover o secret
(`supabase secrets unset PARTNER_PORTAL_ONDA`).

Cada parceiro só vê e escreve os **seus** pedidos: o `source` vem do secret, não
do que o parceiro envia no corpo.
