"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Brand = "esporte" | "play";

interface BrandDetails {
  name: string;
  logoAlt: string;
  description: string;
  themeColor: string;
}

interface BrandContextType {
  brand: Brand;
  setBrand: (brand: Brand) => void;
  brandDetails: BrandDetails;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const [brand, setBrandState] = useState<Brand>("esporte");

  useEffect(() => {
    const stored = localStorage.getItem("licitflow_current_brand") as Brand;
    if (stored === "esporte" || stored === "play") {
      setBrandState(stored);
    }
  }, []);

  const setBrand = (newBrand: Brand) => {
    setBrandState(newBrand);
    localStorage.setItem("licitflow_current_brand", newBrand);
  };

  useEffect(() => {
    const root = window.document.documentElement;
    if (brand === "play") {
      root.classList.add("brand-play");
    } else {
      root.classList.remove("brand-play");
    }
  }, [brand]);

  const brandDetails = {
    esporte: {
      name: "Esporte Valle",
      logoAlt: "Esporte Valle Materiais Esportivos",
      description: "Materiais Esportivos",
      themeColor: "#1F2A5A",
    },
    play: {
      name: "Play Valle",
      logoAlt: "Play Valle Playgrounds e Parques",
      description: "Playgrounds & Parques",
      themeColor: "#0F6F5B",
    },
  }[brand];

  return (
    <BrandContext.Provider value={{ brand, setBrand, brandDetails }}>
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  const context = useContext(BrandContext);
  if (context === undefined) {
    throw new Error("useBrand must be used within a BrandProvider");
  }
  return context;
}
