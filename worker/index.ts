// Cloudflare Worker エントリーポイント
// 全リクエストに Basic 認証をかけたうえで、静的アセット（dist/ 配下）を配信する。
// 認証情報は Cloudflare 側の環境変数（BASIC_AUTH_USER / BASIC_AUTH_PASSWORD）から取得する。
// コードには一切埋め込まない。

interface Env {
  BASIC_AUTH_USER: string;
  BASIC_AUTH_PASSWORD: string;
  ASSETS: { fetch: (request: Request) => Promise<Response> };
}

const REALM = "Restricted";

// タイミング攻撃を避けるため、文字列長を揃えたうえで定数時間比較する
function timingSafeEqual(a: string, b: string): boolean {
  const encoder = new TextEncoder();
  const aBytes = encoder.encode(a);
  const bBytes = encoder.encode(b);
  const maxLength = Math.max(aBytes.length, bBytes.length, 1);
  const aPadded = new Uint8Array(maxLength);
  const bPadded = new Uint8Array(maxLength);
  aPadded.set(aBytes);
  bPadded.set(bBytes);

  let diff = aBytes.length ^ bBytes.length;
  for (let i = 0; i < maxLength; i++) {
    diff |= aPadded[i] ^ bPadded[i];
  }
  return diff === 0;
}

function unauthorizedResponse(): Response {
  return new Response("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": `Basic realm="${REALM}", charset="UTF-8"`,
      "Cache-Control": "no-store",
    },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const expectedUser = env.BASIC_AUTH_USER;
    const expectedPassword = env.BASIC_AUTH_PASSWORD;

    // 環境変数が未設定の場合は、誤って無防備公開しないよう認証失敗として扱う
    if (!expectedUser || !expectedPassword) {
      return unauthorizedResponse();
    }

    const authHeader = request.headers.get("Authorization") ?? "";
    const [scheme, encoded] = authHeader.split(" ");

    if (scheme !== "Basic" || !encoded) {
      return unauthorizedResponse();
    }

    let decoded: string;
    try {
      decoded = atob(encoded);
    } catch {
      return unauthorizedResponse();
    }

    const separatorIndex = decoded.indexOf(":");
    if (separatorIndex === -1) {
      return unauthorizedResponse();
    }

    const user = decoded.slice(0, separatorIndex);
    const password = decoded.slice(separatorIndex + 1);

    const userMatches = timingSafeEqual(user, expectedUser);
    const passwordMatches = timingSafeEqual(password, expectedPassword);

    if (!userMatches || !passwordMatches) {
      return unauthorizedResponse();
    }

    return env.ASSETS.fetch(request);
  },
};
