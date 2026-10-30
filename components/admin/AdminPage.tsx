export default function AdminPage({ title, note }: { title: string; note: string }) {
  return <div><h1 className="font-serif text-4xl">{title}</h1><p className="mt-3 max-w-lg text-sm text-espresso/70">{note}</p></div>;
}
