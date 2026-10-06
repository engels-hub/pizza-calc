import { Calculator } from "@/components/Calculator";
import { PROMOS } from "@/data/promos";
import { getMenus } from "@/lib/menu";

export default async function Page() {
  const menu = await getMenus();
  return <Calculator menu={menu} promos={PROMOS} />;
}
