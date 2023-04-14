import "./globals.css";

export const metadata = {
  title: "GrubRun",
  description: "Create a GrubRun and invite your friends to join you!",
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;
