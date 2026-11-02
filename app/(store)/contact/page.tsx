import ContactForm from "@/components/ContactForm";
export const metadata = { title: "Contact" };
export default function Page() { return (<div className="mx-auto max-w-xl px-5 py-16 md:py-24"><h1 className="font-serif text-5xl">Contact us</h1><p className="mt-3 mb-8 text-espresso/70">Questions about a piece or an order? Send us a message.</p><ContactForm />
  <p className="mt-8 border border-dashed border-gold px-4 py-3 text-sm text-espresso/70"><strong className="font-medium">To be completed by the store owner:</strong> add your support email, phone number and hours.</p></div>); }
