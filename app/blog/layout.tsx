export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="bg-background2 min-h-[calc(100vh-68px)] flex flex-col">
        <div className="grow">{children}</div>
      </div>
    </>
  );
}
