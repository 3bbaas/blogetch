// The single allowed raw-HTML injection point in the app: escaped JSON-LD.
// `<` is escaped as \u003c so a stray `</script>` inside data can never
// break out of the script block.
export default function JsonLd({ data }: { data: unknown }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
