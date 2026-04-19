import { getStore } from "@netlify/blobs";

export const handler = async (event) => {
  const store = getStore("popularity");

  if (event.httpMethod === "GET") {
    const { value } = (await store.get("counts", { type: "json" })) ?? {
      value: {},
    };
    return { statusCode: 200, body: JSON.stringify(value ?? {}) };
  }

  if (event.httpMethod === "POST") {
    const { itemId } = JSON.parse(event.body);
    const existing = (await store.get("counts", { type: "json" }))?.value ?? {};
    existing[itemId] = (existing[itemId] ?? 0) + 1;
    await store.set("counts", JSON.stringify(existing));
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  }

  return { statusCode: 405, body: "Method Not Allowed" };
};
