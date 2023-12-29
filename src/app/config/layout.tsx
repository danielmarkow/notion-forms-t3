import Link from "next/link";

export default function ConfigLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Link href="/config">
        <h1 className="text-sm font-medium">Config</h1>
      </Link>
      {children}
    </>
  );
}
