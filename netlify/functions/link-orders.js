import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const authHeader = event.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return { statusCode: 401, body: "Unauthorized" };
  }

  const token = authHeader.slice(7);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return { statusCode: 401, body: "Invalid token" };
  }

  // Rattache les commandes invité (user_id null) à ce compte
  const { error: updateError } = await supabase
    .from("orders")
    .update({ user_id: user.id })
    .eq("customer_email", user.email)
    .is("user_id", null);

  if (updateError) {
    console.error("Error linking orders:", updateError);
    return { statusCode: 500, body: "Error linking orders" };
  }

  return { statusCode: 200, body: JSON.stringify({ success: true }) };
};
