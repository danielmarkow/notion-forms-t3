import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerAuthSession } from "~/server/auth";

export default async function FormLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();
  if (!session) redirect("/");
  return (
    <>
      <Link href="/config">
        <h1 className="text-sm font-medium hover:underline">Form</h1>
      </Link>
      {session && children}
    </>
  );
}
