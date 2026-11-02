export interface Section { h?: string; p?: string; todo?: string }
export interface PageDef { title: string; intro: string; sections: Section[] }
const LEGAL = "Have this text written or reviewed by a qualified professional before launch.";
/** Only statements about how this website works are written here. Anything about the business itself is a labelled placeholder for the owner. */
export const PAGES: Record<string, PageDef> = {
  about: { title: "Our story", intro: "Sahayra: you deserve this.", sections: [{ todo: "Tell your story: who makes the jewellery, where, in which materials, and what makes it yours." }] },
  faqs: { title: "Frequently asked questions", intro: "Quick answers about using the store.", sections: [
    { h: "How do I track my order?", p: "Sign in and open Account, then Orders. Courier and tracking details appear there once your order has shipped." },
    { h: "Can I save more than one delivery address?", p: "Yes. You can save up to 10 addresses under Account, then Addresses, and choose a default." },
    { h: "I forgot my password.", p: "Use the “Forgot password?” link on the sign-in page and we'll email you a reset link." },
    { h: "How do I save a piece for later?", p: "Tap the heart on any product while signed in. Your wishlist is under Account." },
    { h: "Shipping times and charges", todo: "Add your delivery times, areas served and shipping charges." },
    { h: "Returns and exchanges", p: "Please read our Returns & refunds page for the policy." }] },
  care: { title: "Jewellery care", intro: "Simple habits that keep jewellery looking its best.", sections: [
    { h: "Keep it dry", p: "Remove jewellery before bathing, swimming or exercising. Water and sweat can dull finishes over time." },
    { h: "Apply products first", p: "Put on perfume, lotion and hairspray before your jewellery, and let them dry." },
    { h: "Clean gently", p: "Wipe with a soft, dry cloth after wearing. Avoid harsh chemicals and abrasive cleaners." },
    { h: "Store separately", p: "Keep each piece in its own pouch or compartment so pieces don't scratch or tangle." },
    { todo: "Add care instructions specific to your materials and finishes (for example gold plating or sterling silver)." }] },
  "shipping-policy": { title: "Shipping policy", intro: "How and when orders are delivered.", sections: [{ h: "Delivery areas", todo: "State where you ship." }, { h: "Processing and delivery times", todo: "State dispatch and delivery times." }, { h: "Shipping charges", todo: "State charges and any free-shipping threshold. The amount used at checkout is set in Admin, then Settings." }, { h: "Tracking", p: "Courier and tracking details appear under Account, then Orders, once your order ships." }] },
  returns: { title: "Returns & refunds", intro: "Our returns and refunds policy.", sections: [{ h: "Return window and conditions", todo: "State what can be returned, within how many days, and in what condition." }, { h: "How to start a return", todo: "Explain the steps and contact details." }, { h: "Refunds", todo: "State refund method and timing." }] },
  privacy: { title: "Privacy policy", intro: "How personal information is handled.", sections: [{ h: "Information we collect and why", todo: `Describe account, address, order and contact-form data, and how it is used. ${LEGAL}` }, { h: "Your rights and contact", todo: LEGAL }] },
  terms: { title: "Terms & conditions", intro: "The terms for using this store.", sections: [{ h: "Terms of sale and use", todo: `Add your terms. ${LEGAL}` }] },
};
