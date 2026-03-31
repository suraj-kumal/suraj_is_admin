import NavBar from "@/components/NavBar";
export default function BlogAnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavBar />
      {children}
    </>
  );
}
