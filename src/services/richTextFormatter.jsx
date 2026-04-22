// ============================================================
//  services/richTextFormatter.js - Formatage du texte riche Contentful
//  Convertit le rich text de Contentful en HTML React
// ============================================================

/**
 * Vérifie si le texte est au format rich text de Contentful (JSON)
 */
export const isRichText = (text) => {
  if (!text) return false;
  if (typeof text === "object" && text.nodeType) return true;
  if (typeof text === "string") return false;
  return false;
};

/**
 * Formate le texte riche Contentful en JSX
 * Gère les paragraphes, gras, italique, underline, code, listes, etc.
 */
export const formatRichText = (richTextData) => {
  if (!richTextData) return null;

  // Si c'est du texte brut, diviser par paragraphes (double retour à la ligne)
  if (typeof richTextData === "string") {
    return richTextData
      .split("\n\n")
      .map((paragraph, idx) => {
        if (!paragraph.trim()) return null;
        return (
          <p key={idx} style={{ whiteSpace: "pre-wrap", marginBottom: "1em" }}>
            {formatInlineText(paragraph)}
          </p>
        );
      })
      .filter(Boolean);
  }

  // Si c'est un objet rich text de Contentful
  if (typeof richTextData === "object" && richTextData.nodeType) {
    return renderNode(richTextData);
  }

  return null;
};

/**
 * Formate le texte inline (gras, italique, liens, etc.)
 */
const formatInlineText = (text) => {
  // Regex pour détecter **gras**, *italique*, __underline__, etc.
  const parts = [];
  let lastIndex = 0;

  // Pattern pour les marquages de formatage
  const patterns = [
    // { regex: /\*\*(.+?)\*\*/g, tag: 'strong' },
    { regex: /\*(.+?)\*/g, tag: "em" },
    { regex: /__(.+?)__/g, tag: "strong" },
    // { regex: /__(.+?)__/g, tag: 'u' },
  ];

  // Créer une liste de toutes les correspondances avec leur position
  const matches = [];
  patterns.forEach(({ regex, tag }) => {
    let match;
    while ((match = regex.exec(text)) !== null) {
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        tag,
        content: match[1],
      });
    }
  });

  // Trier les correspondances par position
  matches.sort((a, b) => a.start - b.start);

  // Construire le texte formaté
  let current = 0;
  const result = [];

  matches.forEach((match) => {
    if (current < match.start) {
      result.push(text.slice(current, match.start));
    }
    result.push(createElement(match.tag, { key: match.start }, match.content));
    current = match.end;
  });

  if (current < text.length) {
    result.push(text.slice(current));
  }

  return result.length > 0 ? result : text;
};

/**
 * Crée un élément React avec la balise spécifiée
 */
const createElement = (tag, props, content) => {
  const tags = {
    strong: (props, content) => <strong {...props}>{content}</strong>,
    em: (props, content) => <em {...props}>{content}</em>,
    u: (props, content) => <u {...props}>{content}</u>,
    code: (props, content) => <code {...props}>{content}</code>,
  };
  return tags[tag] ? (
    tags[tag](props, content)
  ) : (
    <span {...props}>{content}</span>
  );
};

/**
 * Rend un nœud rich text de Contentful
 */
const renderNode = (node, key = 0) => {
  if (!node) return null;

  switch (node.nodeType) {
    case "document":
      return (
        <div key={key}>
          {node.content?.map((child, idx) => renderNode(child, idx))}
        </div>
      );

    case "paragraph":
      return (
        <p key={key} style={{ marginBottom: "1em" }}>
          {node.content?.map((child, idx) => renderNode(child, idx))}
        </p>
      );

    case "heading-1":
      return (
        <h1 key={key} style={{ marginBottom: "0.5em", marginTop: "1em" }}>
          {node.content?.map((child, idx) => renderNode(child, idx))}
        </h1>
      );

    case "heading-2":
      return (
        <h2 key={key} style={{ marginBottom: "0.5em", marginTop: "1em" }}>
          {node.content?.map((child, idx) => renderNode(child, idx))}
        </h2>
      );

    case "heading-3":
      return (
        <h3 key={key} style={{ marginBottom: "0.5em", marginTop: "0.8em" }}>
          {node.content?.map((child, idx) => renderNode(child, idx))}
        </h3>
      );

    case "heading-4":
    case "heading-5":
    case "heading-6":
      return (
        <h4 key={key} style={{ marginBottom: "0.5em", marginTop: "0.6em" }}>
          {node.content?.map((child, idx) => renderNode(child, idx))}
        </h4>
      );

    case "unordered-list":
      return (
        <ul key={key} style={{ marginBottom: "1em", marginLeft: "2em" }}>
          {node.content?.map((child, idx) => renderNode(child, idx))}
        </ul>
      );

    case "ordered-list":
      return (
        <ol key={key} style={{ marginBottom: "1em", marginLeft: "2em" }}>
          {node.content?.map((child, idx) => renderNode(child, idx))}
        </ol>
      );

    case "list-item":
      return (
        <li key={key} style={{ marginBottom: "0.5em" }}>
          {node.content?.map((child, idx) => renderNode(child, idx))}
        </li>
      );

    case "blockquote":
      return (
        <blockquote
          key={key}
          style={{
            marginLeft: "1.5em",
            paddingLeft: "1em",
            borderLeft: "3px solid #ccc",
            fontStyle: "italic",
            marginBottom: "1em",
          }}
        >
          {node.content?.map((child, idx) => renderNode(child, idx))}
        </blockquote>
      );

    case "hr":
      return <hr key={key} style={{ marginBottom: "1em", marginTop: "1em" }} />;

    case "text":
      if (node.marks && node.marks.length > 0) {
        return renderMarkedText(node.value, node.marks, key);
      }
      return <span key={key}>{node.value}</span>;

    case "hyperlink":
      return (
        <a
          key={key}
          href={node.data.uri}
          target="_blank"
          rel="noopener noreferrer"
        >
          {node.content?.map((child, idx) => renderNode(child, idx))}
        </a>
      );

    case "asset-hyperlink":
      return (
        <a key={key} href={node.data.target?.fields?.file?.url} download>
          {node.content?.map((child, idx) => renderNode(child, idx))}
        </a>
      );

    case "embedded-asset-block":
      const imageUrl = node.data.target?.fields?.file?.url;
      return imageUrl ? (
        <img
          key={key}
          src={`https:${imageUrl}?w=800&fm=webp&q=85`}
          alt="Embedded asset"
          style={{ maxWidth: "100%", marginBottom: "1em" }}
        />
      ) : null;

    default:
      return null;
  }
};

/**
 * Rend le texte avec les marques appliquées (gras, italique, etc.)
 */
const renderMarkedText = (text, marks, key) => {
  let element = <span key={key}>{text}</span>;

  marks.forEach((mark) => {
    switch (mark.type) {
      case "bold":
        element = <strong key={`${key}-bold`}>{element}</strong>;
        break;
      case "italic":
        element = <em key={`${key}-italic`}>{element}</em>;
        break;
      case "underline":
        element = <u key={`${key}-underline`}>{element}</u>;
        break;
      case "code":
        element = <code key={`${key}-code`}>{element}</code>;
        break;
      case "strikethrough":
        element = <s key={`${key}-strike`}>{element}</s>;
        break;
      default:
        break;
    }
  });

  return element;
};

export default { formatRichText, isRichText };
