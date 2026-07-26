import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * Compatibilidade temporária com versões antigas do frontend.
 * A autorização agora é feita exclusivamente pelo Supabase Auth.
 * Esta rota impede que bundles em cache voltem a exigir uma whitelist
 * baseada em armazenamento local ou banco simulado.
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");

  const collectionName = String(req.query.collectionName || "");

  if (collectionName === "settings") {
    return res.status(200).json([
      {
        id: "whitelist_enabled",
        key: "whitelist_enabled",
        value: false,
        name: "Controle antigo desativado",
      },
    ]);
  }

  if (collectionName === "whitelist") {
    return res.status(200).json([]);
  }

  return res.status(200).json([]);
}
