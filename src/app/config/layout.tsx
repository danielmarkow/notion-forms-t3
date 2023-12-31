import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "~/server/auth";

export default async function ConfigLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();
  if (!session) redirect("/");
  return (
    <>
      <Link href="/config">
        <h1 className="text-sm font-medium hover:underline">Config</h1>
      </Link>
      {session && children}
    </>
  );
}
