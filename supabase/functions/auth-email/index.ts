/**
 * Send Email Hook do SAL HUB.
 *
 * O Supabase Auth, sem provedor próprio, envia pelo SMTP de cortesia — poucos
 * e-mails por hora. Ao convidar uma equipe inteira, a maioria dos convites
 * simplesmente não sai, e o erro parece ser do portal.
 *
 * Esta função intercepta o envio e delega ao Email Agent oficial da SAL
 * (ia.sal@salexpress.com.br), que é o ponto único de envio da empresa.
 *
 * Cuidados que valem para qualquer mudança aqui:
 *
 *  - o corpo carrega um link com token de acesso de uso único. O Email Agent
 *    registra apenas destinatário, assunto e status — nunca o corpo —, então o
 *    link não vai parar em log. Não acrescente o link ao assunto.
 *  - se esta função falhar, o Auth não envia e-mail nenhum. Toda falha é
 *    devolvida com mensagem clara e o status certo, para o Supabase repetir.
 */

import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'

const EMAIL_AGENT_URL = 'https://fsswfealkyavtjfaleil.supabase.co/functions/v1/email-agent'

/** Textos por tipo de e-mail do Auth. */
const MENSAGENS: Record<string, { assunto: string; titulo: string; texto: string; botao: string }> = {
  invite: {
    assunto: 'Seu acesso ao SAL HUB',
    titulo: 'Você foi convidado para o SAL HUB',
    texto:
      'O portal reúne, em um lugar só, os sistemas e indicadores liberados para o seu perfil. Defina sua senha para entrar.',
    botao: 'Definir minha senha',
  },
  recovery: {
    assunto: 'Redefinir sua senha do SAL HUB',
    titulo: 'Redefinição de senha',
    texto:
      'Recebemos um pedido para redefinir a sua senha. Se não foi você, pode ignorar este e-mail — nada muda.',
    botao: 'Criar nova senha',
  },
  signup: {
    assunto: 'Confirme seu acesso ao SAL HUB',
    titulo: 'Confirme seu e-mail',
    texto: 'Confirme este endereço para ativar o seu acesso ao portal.',
    botao: 'Confirmar e-mail',
  },
  magiclink: {
    assunto: 'Seu link de acesso ao SAL HUB',
    titulo: 'Entrar no portal',
    texto: 'Use o botão abaixo para entrar. O link vale por tempo limitado e é de uso único.',
    botao: 'Entrar no SAL HUB',
  },
  email_change: {
    assunto: 'Confirme seu novo e-mail no SAL HUB',
    titulo: 'Confirmação de novo e-mail',
    texto: 'Confirme este endereço para concluir a troca de e-mail da sua conta.',
    botao: 'Confirmar novo e-mail',
  },
}

const PADRAO = MENSAGENS.magiclink!

function escapar(valor: string): string {
  return valor
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * HTML do e-mail. Tabelas e estilo embutido de propósito: cliente de e-mail
 * ignora folha de estilo e boa parte do CSS moderno.
 */
function montarHtml(titulo: string, texto: string, botao: string, link: string): string {
  const url = escapar(link)

  return `<!doctype html>
<html lang="pt-BR">
<body style="margin:0;padding:24px;background:#f4f6f9;font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:#111823;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e2e7ee;border-radius:14px;">
    <tr>
      <td style="padding:28px 28px 0 28px;">
        <table role="presentation" cellpadding="0" cellspacing="0">
          <tr>
            <td style="background:#17416d;color:#ffffff;font-size:11px;font-weight:700;letter-spacing:.5px;padding:10px 12px;border-radius:10px;">SAL</td>
            <td style="padding-left:10px;">
              <div style="font-size:15px;font-weight:600;line-height:1;">SAL HUB</div>
              <div style="font-size:11px;color:#636f80;line-height:1;padding-top:4px;">Portal de Sistemas e Indicadores</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:24px 28px 8px 28px;">
        <h1 style="margin:0;font-size:18px;font-weight:600;">${escapar(titulo)}</h1>
        <p style="margin:10px 0 0 0;font-size:14px;line-height:1.6;color:#4d5869;">${escapar(texto)}</p>
      </td>
    </tr>
    <tr>
      <td style="padding:20px 28px 4px 28px;">
        <a href="${url}" style="display:inline-block;background:#17416d;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 20px;border-radius:10px;">${escapar(botao)}</a>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 28px 28px 28px;">
        <p style="margin:0;font-size:12px;line-height:1.6;color:#636f80;">
          Se o botão não funcionar, copie este endereço no navegador:<br>
          <span style="color:#1b558e;word-break:break-all;">${url}</span>
        </p>
        <p style="margin:16px 0 0 0;font-size:11px;color:#8792a3;border-top:1px solid #e2e7ee;padding-top:14px;">
          Link de uso único e com prazo de validade. Se você não pediu este e-mail, ignore esta mensagem.<br>
          SAL Express · mensagem automática, não responda.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`
}

Deno.serve(async (request) => {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const hookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET')
  const agentSecret = Deno.env.get('EMAIL_AGENT_TRIGGER_SECRET')

  if (!hookSecret || !agentSecret) {
    console.error('Segredos ausentes: SEND_EMAIL_HOOK_SECRET e/ou EMAIL_AGENT_TRIGGER_SECRET')
    return new Response(JSON.stringify({ error: { message: 'Hook mal configurado' } }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const payload = await request.text()

  // O Auth assina a chamada; sem verificar, qualquer um dispararia e-mails.
  let evento: {
    user: { email: string }
    email_data: {
      token_hash: string
      redirect_to: string
      email_action_type: string
      site_url: string
    }
  }

  try {
    const headers = Object.fromEntries(request.headers)
    const webhook = new Webhook(hookSecret.replace('v1,whsec_', ''))
    evento = webhook.verify(payload, headers) as typeof evento
  } catch (erro) {
    console.error('Assinatura do hook inválida:', erro)
    return new Response(JSON.stringify({ error: { message: 'Assinatura inválida' } }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { user, email_data: dados } = evento
  const modelo = MENSAGENS[dados.email_action_type] ?? PADRAO

  // Endereço de verificação do próprio Auth, que valida o token e então
  // devolve o usuário para o portal.
  const base = (dados.site_url || '').replace(/\/$/, '')
  const link =
    `${Deno.env.get('SUPABASE_URL')}/auth/v1/verify` +
    `?token=${encodeURIComponent(dados.token_hash)}` +
    `&type=${encodeURIComponent(dados.email_action_type)}` +
    `&redirect_to=${encodeURIComponent(dados.redirect_to || base)}`

  const resposta = await fetch(EMAIL_AGENT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-trigger-secret': agentSecret },
    body: JSON.stringify({
      destinatario: user.email,
      tag: 'AÇÃO NECESSÁRIA',
      assunto: modelo.assunto,
      corpo: montarHtml(modelo.titulo, modelo.texto, modelo.botao, link),
      corpo_html: true,
      // Identifica a origem na tabela email_agent_log do projeto relatorios-raw.
      origem: `sal-hub-auth:${dados.email_action_type}`,
    }),
  })

  if (!resposta.ok) {
    const detalhe = await resposta.text()
    console.error('Email Agent recusou o envio:', resposta.status, detalhe)
    // 500 faz o Auth tratar como falha de envio, em vez de dar sucesso silencioso.
    return new Response(
      JSON.stringify({ error: { message: 'Falha ao enviar o e-mail de autenticação' } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }

  return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } })
})
