import ResourceManager from "@/components/admin/ResourceManager";
export const metadata = { title: "Categories" };
export default function Page() { return <ResourceManager title="Categories" endpoint="/api/admin/categories" intro="Once you add any category here, the store menu shows only the categories you manage. Add every category you need." emptyTitle="No custom categories" emptyBody="The store is using its built-in default categories until you add your own."
  fields={[{ key: "name", label: "Name" }, { key: "slug", label: "URL slug (optional)", hint: "Generated from the name if left blank.", lockOnEdit: true }, { key: "order", label: "Menu order", type: "number" }]} columns={[{ key: "name", label: "Name" }, { key: "slug", label: "Slug" }, { key: "order", label: "Order" }]} />; }
