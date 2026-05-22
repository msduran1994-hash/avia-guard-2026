import { getAllEntities } from "@/lib/base44";
import type { AllowedUser } from "@/types";
import UsuariosClient from "./UsuariosClient";

export const revalidate = 0;

export default async function UsuariosPage() {
  const users = await getAllEntities<AllowedUser>("AllowedUser");
  return <UsuariosClient initialUsers={users} />;
}
