import { getMenus } from "@/lib/menu";

export async function GET() {
  return Response.json(await getMenus());
}
