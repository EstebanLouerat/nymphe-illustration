export default async () => {
  const has = (k) => Boolean(process.env[k]);
  return Response.json({
    VITE_CONTENTFUL_SPACE_ID: has("VITE_CONTENTFUL_SPACE_ID"),
    VITE_CONTENTFUL_ACCESS_TOKEN: has("VITE_CONTENTFUL_ACCESS_TOKEN"),
  });
};
