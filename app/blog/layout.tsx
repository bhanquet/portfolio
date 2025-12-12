import Header from "@/components/shared/header";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="bg-background2 min-h-screen flex flex-col">
        <Header />
        <div className="grow">{children}</div>
      </div>
    </>
  );
}
