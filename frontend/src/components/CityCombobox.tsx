"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Loader2, X } from "lucide-react";

interface CityComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function CityCombobox({ value, onChange, placeholder = "Ex: São Paulo - SP" }: CityComboboxProps) {
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Fetch cities on mount
  useEffect(() => {
    const fetchCities = async () => {
      try {
        // Check cache first
        const cached = sessionStorage.getItem("licitflow_cities_v2");
        if (cached) {
          setCities(JSON.parse(cached));
          setLoading(false);
          return;
        }

        const response = await fetch("https://servicodados.ibge.gov.br/api/v1/localidades/municipios");
        const data = await response.json();
        
        // Format: "São José dos Campos - SP"
        const formatted = data.map((city: any) => {
          const uf = city.microrregiao?.mesorregiao?.UF?.sigla || city["regiao-imediata"]?.["regiao-intermediaria"]?.UF?.sigla || "";
          return `${city.nome} - ${uf}`;
        }).sort();
        
        setCities(formatted);
        sessionStorage.setItem("licitflow_cities_v2", JSON.stringify(formatted));
      } catch (error) {
        console.error("Failed to fetch cities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter logic (with accent removal)
  const normalize = (str: string) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  const filteredCities = query === ""
    ? cities.slice(0, 100) // limit initial render to avoid freezing
    : cities.filter((city) => normalize(city).includes(normalize(query))).slice(0, 100);

  const handleSelect = (city: string) => {
    onChange(city);
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      {/* Selected Value Display or Input */}
      {value ? (
        <div 
          className="flex items-center justify-between w-full px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900 font-semibold cursor-pointer group transition-all hover:bg-indigo-100" 
          onClick={() => setIsOpen(true)}
        >
          <span className="truncate">{value}</span>
          <button 
            type="button" 
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
            className="text-indigo-400 hover:text-rose-500 transition-colors p-0.5 rounded-full hover:bg-rose-50"
            title="Limpar cidade"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="relative">
          <input
            type="text"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 pr-8 placeholder:text-slate-400"
            placeholder={loading ? "Carregando cidades do IBGE..." : placeholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            disabled={loading}
          />
          <div className="absolute right-2.5 top-2.5 text-slate-400 pointer-events-none">
            {loading ? <Loader2 size={14} className="animate-spin text-indigo-500" /> : <ChevronDown size={14} />}
          </div>
        </div>
      )}

      {/* Dropdown Menu */}
      {isOpen && !value && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-auto animate-in fade-in slide-in-from-top-1 custom-scrollbar">
          {filteredCities.length === 0 ? (
            <div className="px-3 py-4 text-center text-xs text-slate-500">
              Nenhuma cidade encontrada.
            </div>
          ) : (
            <ul className="py-1">
              {filteredCities.map((city) => (
                <li
                  key={city}
                  onClick={() => handleSelect(city)}
                  className="px-3 py-2 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer transition-colors"
                >
                  {city}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
