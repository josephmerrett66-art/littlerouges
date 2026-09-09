import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Tiny Uprising — Robot Swarm Survival',
  description:
    'One tiny robot. One enormous uprising. Move, collect XP, and build your robot swarm in this isometric survival game.',
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
