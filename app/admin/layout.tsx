export const metadata = { title: { default: "Admin", template: "%s | Sahayra Admin" }, robots: { index: false, follow: false } };
export default function AdminRoot({ children }: { children: React.ReactNode }) { return <div className="min-h-screen bg-ivory">{children}</div>; }
