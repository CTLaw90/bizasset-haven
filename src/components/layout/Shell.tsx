
import React from "react";
import { Outlet } from "react-router-dom";
import { Navigation } from "./Navigation";

export const Shell = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container pt-20 pb-16 space-y-8">
        <Outlet />
      </main>
    </div>
  );
};
