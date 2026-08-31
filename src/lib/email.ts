import { Resend } from "resend";

// Lazy init — avoids build-time throw when env var is absent
function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY not set");
  return new Resend(key);
}

const FROM = "AuraRank <hello@aurarank.me>";
const REPLY_TO = "fdirinot@gmail.com";
const LOGO = "https://aurarank.me/aurarank-logo.png";
const APP_URL = "https://aurarank.me";

type Lang = "en" | "es";

const COPY: Record<Lang, {
  subject: string;
  greeting: string;
  tagline: string;
  betaBadge: string;
  intro: string;
  s1Title: string; s1Body: string;
  s2Title: string; s2Body: string;
  s3Title: string; s3Body: string;
  s4Title: string; s4Body: string;
  s5Title: string; s5Body: string;
  cta: string;
  replyTitle: string; replyBody: string;
  footerNote: string;
}> = {
  en: {
    subject: "Welcome to AuraRank — Your Aura Begins Here 👁️",
    greeting: "Welcome,",
    tagline: "Your aura begins now.",
    betaBadge: "BETA — FOUNDING MEMBER",
    intro: "You just joined one of the most exciting social experiments on the internet. AuraRank is where you post your best content, get rated by the community, and build a real Aura Score. This is just the beginning.",
    s1Title: "🚀 Post. Get Rated. Build Your Aura.",
    s1Body: "Upload your best photos or clips. The community rates them. Your Aura Score grows with every rating. Climb the global rankings and prove your vibe is unmatched.",
    s2Title: "⚡ You're in the Beta — This Is Phase One.",
    s2Body: "AuraRank is in early beta. Every feature you see today is just a fraction of what's coming. Group Aura battles, brand collabs, verified profiles, exclusive challenges, and much more are already in development. You'll get first access to all of it.",
    s3Title: "🏆 You're Not Just a User — You're an Ambassador.",
    s3Body: "Because you're one of the first people to join AuraRank, you've automatically earned Ambassador status. That means your voice matters in shaping this platform. <strong style=\"color:#a855f7\">Reply to this email with your Instagram, TikTok, X, YouTube, or any social link</strong> — and we'll feature you on AuraRank. We want to build this with you.",
    s4Title: "💎 You're a Pro User. Forever.",
    s4Body: "All founding members like you are granted permanent <strong style=\"color:#a855f7\">Pro status</strong>. When Pro features launch — higher post limits, exclusive aura boosts, priority in rankings, early access to every new feature — you'll have them automatically. Users who join later will need to earn or pay for Pro. Yours is free. Forever.",
    s5Title: "🔮 What's Coming Next.",
    s5Body: "Group Aura battles · Verified profiles · Brand collaboration challenges · Real-time leaderboards · Exclusive ambassador perks · Aura marketplace · And things we haven't announced yet.",
    cta: "Create Your First Post →",
    replyTitle: "Want to be featured on AuraRank?",
    replyBody: "Reply to this email with your social media links and we'll spotlight your profile to the entire AuraRank community. Ambassador perk #1 — claimed.",
    footerNote: "You received this because you signed up for AuraRank. No spam — ever. This is the only automated email we'll send you.",
  },
  es: {
    subject: "Bienvenido a AuraRank — Tu Aura Empieza Aquí 👁️",
    greeting: "Bienvenido,",
    tagline: "Tu aura empieza ahora.",
    betaBadge: "BETA — MIEMBRO FUNDADOR",
    intro: "Acabas de unirte a uno de los experimentos sociales más emocionantes de internet. AuraRank es donde publicas tu mejor contenido, la comunidad te califica y construyes un Aura Score real. Esto es apenas el comienzo.",
    s1Title: "🚀 Publica. Sé Calificado. Construye tu Aura.",
    s1Body: "Sube tus mejores fotos o clips. La comunidad los califica. Tu Aura Score crece con cada calificación. Escala en el ranking global y demuestra que tu vibra no tiene rival.",
    s2Title: "⚡ Estás en la Beta — Esta es la Fase Uno.",
    s2Body: "AuraRank está en beta temprana. Todo lo que ves hoy es solo una fracción de lo que viene. Batallas de Aura en grupo, colaboraciones con marcas, perfiles verificados, desafíos exclusivos y mucho más ya están en desarrollo. Tendrás acceso prioritario a todo.",
    s3Title: "🏆 No Eres Solo un Usuario — Eres un Embajador.",
    s3Body: "Por ser uno de los primeros en unirte a AuraRank, automáticamente has ganado el estatus de Embajador. Tu opinión importa para dar forma a esta plataforma. <strong style=\"color:#a855f7\">Responde a este correo con tu Instagram, TikTok, X, YouTube o cualquier red social</strong> — y te destacaremos en AuraRank. Queremos construir esto contigo.",
    s4Title: "💎 Eres un Usuario Pro. Para Siempre.",
    s4Body: "Todos los miembros fundadores como tú reciben el estatus <strong style=\"color:#a855f7\">Pro permanente</strong>. Cuando lancemos las funciones Pro — mayor límite de posts, impulsos de aura exclusivos, prioridad en rankings, acceso anticipado a cada nueva función — las tendrás automáticamente. Los usuarios que se unan después tendrán que ganárselo o pagarlo. El tuyo es gratis. Para siempre.",
    s5Title: "🔮 Qué Viene Después.",
    s5Body: "Batallas de Aura en grupo · Perfiles verificados · Desafíos de colaboración con marcas · Rankings en tiempo real · Ventajas exclusivas de embajador · Marketplace de Aura · Y cosas que aún no hemos anunciado.",
    cta: "Crea Tu Primer Post →",
    replyTitle: "¿Quieres ser destacado en AuraRank?",
    replyBody: "Responde este correo con tus redes sociales y destacaremos tu perfil a toda la comunidad de AuraRank. Ventaja de embajador #1 — reclamada.",
    footerNote: "Recibiste esto porque te registraste en AuraRank. Sin spam — nunca. Este es el único correo automatizado que te enviaremos.",
  },
};

function buildHtml(name: string, lang: Lang): string {
  const c = COPY[lang];
  const firstName = name.split(" ")[0] || name;

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1.0" />
<title>${c.subject}</title>
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background:#09090b;-webkit-font-smoothing:antialiased">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#09090b">
<tr><td align="center" style="padding:32px 16px 48px">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px">

  <!-- HEADER -->
  <tr>
    <td style="background:linear-gradient(160deg,#1e0b3e 0%,#130824 50%,#0a0511 100%);border-radius:20px 20px 0 0;padding:48px 48px 40px;text-align:center;border:1px solid rgba(124,58,237,0.35);border-bottom:none">
      <img src="${LOGO}" alt="AuraRank" width="130" height="auto" style="display:block;margin:0 auto 32px;max-width:130px" />
      <div style="width:88px;height:88px;margin:0 auto 24px;background:radial-gradient(circle at center,rgba(168,85,247,0.9) 0%,rgba(124,58,237,0.5) 40%,rgba(124,58,237,0.1) 70%,transparent 100%);border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 0 48px rgba(124,58,237,0.6),0 0 96px rgba(124,58,237,0.2)">
        <div style="width:88px;height:88px;line-height:88px;text-align:center;font-size:38px">👁️</div>
      </div>
      <div style="display:inline-block;background:rgba(124,58,237,0.2);border:1px solid rgba(124,58,237,0.4);border-radius:99px;padding:5px 16px;margin-bottom:20px">
        <span style="font-size:10px;font-weight:700;color:#a855f7;letter-spacing:2.5px;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">${c.betaBadge}</span>
      </div>
      <h1 style="margin:0 0 6px;font-size:30px;font-weight:800;color:#fafafa;letter-spacing:-0.5px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">${c.greeting} ${firstName} 👋</h1>
      <p style="margin:0;font-size:14px;color:#a855f7;font-weight:600;letter-spacing:0.5px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">${c.tagline}</p>
    </td>
  </tr>

  <!-- INTRO -->
  <tr>
    <td style="background:#111114;padding:36px 48px 28px;border-left:1px solid rgba(124,58,237,0.2);border-right:1px solid rgba(124,58,237,0.2)">
      <p style="margin:0;font-size:15px;line-height:1.7;color:#d4d4d8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">${c.intro}</p>
    </td>
  </tr>

  <!-- DIVIDER -->
  <tr>
    <td style="background:#111114;padding:0 48px;border-left:1px solid rgba(124,58,237,0.2);border-right:1px solid rgba(124,58,237,0.2)">
      <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(124,58,237,0.4),transparent)"></div>
    </td>
  </tr>

  <!-- SECTION 1 -->
  <tr>
    <td style="background:#111114;padding:28px 48px;border-left:1px solid rgba(124,58,237,0.2);border-right:1px solid rgba(124,58,237,0.2)">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="border-left:3px solid #7c3aed;padding-left:16px">
            <h2 style="margin:0 0 8px;font-size:15px;font-weight:800;color:#fafafa;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">${c.s1Title}</h2>
            <p style="margin:0;font-size:13.5px;line-height:1.65;color:#a1a1aa;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">${c.s1Body}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- SECTION 2 -->
  <tr>
    <td style="background:#111114;padding:4px 48px 28px;border-left:1px solid rgba(124,58,237,0.2);border-right:1px solid rgba(124,58,237,0.2)">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="border-left:3px solid #84cc16;padding-left:16px">
            <h2 style="margin:0 0 8px;font-size:15px;font-weight:800;color:#fafafa;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">${c.s2Title}</h2>
            <p style="margin:0;font-size:13.5px;line-height:1.65;color:#a1a1aa;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">${c.s2Body}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- SECTION 3 — Ambassador (special card) -->
  <tr>
    <td style="background:#111114;padding:4px 48px 28px;border-left:1px solid rgba(124,58,237,0.2);border-right:1px solid rgba(124,58,237,0.2)">
      <div style="background:linear-gradient(135deg,rgba(250,189,0,0.06),rgba(245,158,11,0.04));border:1px solid rgba(245,158,11,0.25);border-radius:12px;padding:20px 22px">
        <h2 style="margin:0 0 8px;font-size:15px;font-weight:800;color:#fbbf24;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">${c.s3Title}</h2>
        <p style="margin:0;font-size:13.5px;line-height:1.65;color:#a1a1aa;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">${c.s3Body}</p>
      </div>
    </td>
  </tr>

  <!-- SECTION 4 — Pro (special card) -->
  <tr>
    <td style="background:#111114;padding:4px 48px 28px;border-left:1px solid rgba(124,58,237,0.2);border-right:1px solid rgba(124,58,237,0.2)">
      <div style="background:linear-gradient(135deg,rgba(124,58,237,0.12),rgba(168,85,247,0.06));border:1px solid rgba(124,58,237,0.35);border-radius:12px;padding:20px 22px">
        <div style="display:inline-block;background:rgba(124,58,237,0.25);border:1px solid rgba(124,58,237,0.5);border-radius:6px;padding:3px 10px;margin-bottom:10px">
          <span style="font-size:10px;font-weight:700;color:#a855f7;letter-spacing:1.5px;text-transform:uppercase;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">PRO</span>
        </div>
        <h2 style="margin:0 0 8px;font-size:15px;font-weight:800;color:#fafafa;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">${c.s4Title}</h2>
        <p style="margin:0;font-size:13.5px;line-height:1.65;color:#a1a1aa;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">${c.s4Body}</p>
      </div>
    </td>
  </tr>

  <!-- SECTION 5 — Coming soon -->
  <tr>
    <td style="background:#111114;padding:4px 48px 28px;border-left:1px solid rgba(124,58,237,0.2);border-right:1px solid rgba(124,58,237,0.2)">
      <div style="background:rgba(14,165,233,0.05);border:1px solid rgba(14,165,233,0.2);border-radius:12px;padding:20px 22px">
        <h2 style="margin:0 0 8px;font-size:15px;font-weight:800;color:#38bdf8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">${c.s5Title}</h2>
        <p style="margin:0;font-size:13.5px;line-height:1.65;color:#a1a1aa;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">${c.s5Body}</p>
      </div>
    </td>
  </tr>

  <!-- CTA -->
  <tr>
    <td style="background:#111114;padding:8px 48px 40px;text-align:center;border-left:1px solid rgba(124,58,237,0.2);border-right:1px solid rgba(124,58,237,0.2)">
      <a href="${APP_URL}/create" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#ffffff;font-size:14px;font-weight:800;text-decoration:none;padding:14px 36px;border-radius:12px;letter-spacing:0.3px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;box-shadow:0 4px 24px rgba(124,58,237,0.4)">${c.cta}</a>
    </td>
  </tr>

  <!-- DIVIDER -->
  <tr>
    <td style="background:#111114;padding:0 48px;border-left:1px solid rgba(124,58,237,0.2);border-right:1px solid rgba(124,58,237,0.2)">
      <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(124,58,237,0.4),transparent)"></div>
    </td>
  </tr>

  <!-- REPLY SECTION -->
  <tr>
    <td style="background:#111114;padding:28px 48px 36px;border-left:1px solid rgba(124,58,237,0.2);border-right:1px solid rgba(124,58,237,0.2)">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="border-left:3px solid #a855f7;padding-left:16px">
            <h3 style="margin:0 0 6px;font-size:14px;font-weight:800;color:#fafafa;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">${c.replyTitle}</h3>
            <p style="margin:0;font-size:13px;line-height:1.6;color:#71717a;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">${c.replyBody}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- FOOTER -->
  <tr>
    <td style="background:#0d0d10;border-radius:0 0 20px 20px;padding:24px 48px;text-align:center;border:1px solid rgba(124,58,237,0.2);border-top:1px solid rgba(255,255,255,0.05)">
      <img src="${LOGO}" alt="AuraRank" width="80" height="auto" style="display:block;margin:0 auto 12px;max-width:80px;opacity:0.5" />
      <p style="margin:0 0 6px;font-size:11px;color:#52525b;line-height:1.5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">${c.footerNote}</p>
      <p style="margin:0;font-size:11px;color:#3f3f46;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">© ${new Date().getFullYear()} AuraRank · <a href="${APP_URL}" style="color:#52525b;text-decoration:none">aurarank.me</a></p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

export async function sendWelcomeEmail(opts: {
  to: string;
  displayName: string;
  lang: Lang;
}): Promise<void> {
  const { to, displayName, lang } = opts;
  try {
    const resend = getResend();
    await resend.emails.send({
      from: FROM,
      to,
      replyTo: REPLY_TO,
      subject: COPY[lang].subject,
      html: buildHtml(displayName, lang),
    });
  } catch (err) {
    // Non-blocking — log but never throw
    console.error("[email] sendWelcomeEmail failed:", err);
  }
}
