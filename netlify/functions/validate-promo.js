// GET /api/validate-promo?code=...
// Valide un code promo directement via l'API Stripe
// → respecte expires_at, max_redemptions, times_redeemed, active, restrictions

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const code = event.queryStringParameters?.code?.trim();

  if (!code) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Paramètre 'code' manquant" }),
    };
  }

  try {
    // Recherche du promotion code via l'API Stripe
    const { data: promoCodes } = await stripe.promotionCodes.list({
      code,
      active: true,
      limit: 1,
    });

    if (promoCodes.length === 0) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          valid: false,
          reason: "Code promo invalide ou expiré",
        }),
      };
    }

    const promoCode = promoCodes[0];

    // Vérifier que le coupon ID existe dans promotion
    if (!promoCode.promotion?.coupon) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          valid: false,
          reason: "Code promo invalide (pas de coupon associé)",
        }),
      };
    }

    // Récupère le coupon séparément
    const coupon = await stripe.coupons.retrieve(promoCode.promotion.coupon);
    const now = Math.floor(Date.now() / 1000); // timestamp UNIX

    // ── Vérification 1 : le promo code est-il actif ?
    if (!promoCode.active) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          valid: false,
          reason: "Ce code n'est plus actif",
        }),
      };
    }

    // ── Vérification 2 : le coupon sous-jacent existe-t-il et est-il valide ?
    if (!coupon || !coupon.valid) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          valid: false,
          reason: "Ce code promo n'est plus disponible",
        }),
      };
    }

    // ── Vérification 3 : date d'expiration du promotion code
    if (promoCode.expires_at && promoCode.expires_at < now) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          valid: false,
          reason: "Ce code promo a expiré",
        }),
      };
    }

    // ── Vérification 4 : date d'expiration du coupon
    if (coupon.redeem_by && coupon.redeem_by < now) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          valid: false,
          reason: "Ce code promo a expiré",
        }),
      };
    }

    // ── Vérification 5 : nombre max d'utilisations du promotion code
    if (
      promoCode.max_redemptions !== null &&
      promoCode.times_redeemed >= promoCode.max_redemptions
    ) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          valid: false,
          reason: "Ce code promo a atteint son nombre maximum d'utilisations",
        }),
      };
    }

    // ── Vérification 6 : nombre max d'utilisations du coupon
    if (
      coupon.max_redemptions !== null &&
      coupon.times_redeemed >= coupon.max_redemptions
    ) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          valid: false,
          reason: "Ce code promo a atteint son nombre maximum d'utilisations",
        }),
      };
    }

    // ── Construction de la réponse (on n'expose que ce dont le client a besoin)
    const discount = buildDiscountSummary(coupon);

    const response = {
      valid: true,
      promoId: promoCode.id, // on renvoie l'ID Stripe pour l'utiliser dans checkout
      code: promoCode.code,
      discount,
      // Metadata utile pour l'affichage
      expiresAt: promoCode.expires_at || coupon.redeem_by || null,
      usagesLeft:
        promoCode.max_redemptions !== null
          ? promoCode.max_redemptions - promoCode.times_redeemed
          : null,
    };

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(response),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Erreur lors de la validation du code",
        message: err?.message || "Erreur inconnue",
      }),
    };
  }
};

/**
 * Construit un résumé lisible de la réduction à partir du coupon Stripe.
 * Stripe supporte : percent_off, amount_off (en centimes), duration
 */
function buildDiscountSummary(coupon) {
  if (coupon.percent_off) {
    return {
      type: "percent",
      value: coupon.percent_off,
      label: `−${coupon.percent_off} %`,
    };
  }

  if (coupon.amount_off) {
    const amount = (coupon.amount_off / 100).toFixed(2);
    const currency = (coupon.currency || "eur").toUpperCase();
    return {
      type: "amount",
      value: coupon.amount_off / 100,
      currency,
      label: `−${amount} ${currency}`,
    };
  }

  return { type: "unknown", label: "Réduction appliquée" };
}
