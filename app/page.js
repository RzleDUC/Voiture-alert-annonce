"use client"; // DOIT être la première ligne du fichier

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

import HeroSection from "@/components/home/HeroSection";
import ProjectInfoCard from "@/components/home/ProjectInfoCard";

export default function Home() {
  // --- TEST SUPABASE AU CHARGEMENT ---
  useEffect(() => {
    supabase
      .from("test")
      .select("*")
      .then((res) => {
        console.log("SUPABASE TEST :", res);
      });
  }, []);

  // --- TON INTERFACE EXISTANTE ---
  return (
    <main className="space-y-4 md:space-y-6">
      <HeroSection />
      <ProjectInfoCard />
    </main>
  );
}
