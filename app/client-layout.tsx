"use client";

import { Global } from "@emotion/react";
import { globalStyles } from "./globals";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Global styles={globalStyles} />
      {children}
    </>
  );
}
