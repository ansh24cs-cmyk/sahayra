import { Suspense } from "react";
import Shop from "./Shop";
export const metadata = { title: "Shop" };
export default function Page() { return <Suspense fallback={<div className="mx-auto h-96 max-w-7xl animate-pulse px-5" />}><Shop /></Suspense>; }
