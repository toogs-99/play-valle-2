"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Loader2, X, Plus, Building2, MapPin } from "lucide-react";

interface CityComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function CityCombobox({
  value,
  onChange,
  placeholder = "Busque ou digite a cidade/secretaria...",
}: CityComboboxProps) {
  const [cities, setCities] = useState<string[]>([]);
  const [secretarias, setSecretarias] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. Carrega cidades (IBGE) e secretarias customizadas ao montar
  useEffect(() => {
    let cancelled = false;

    async function init() {
      setLoading(true);

      // Carregar secretarias do cache local imediatamente
      try {
        const localCustom = localStorage.getItem("licitflow_custom_locations");
        if (localCustom) {
          const parsed = JSON.parse(localCustom);
          if (Array.isArray(parsed)) {
            setSecretarias(parsed);
          }
        }
      } catch {}

      // Buscar secretarias salvas no banco de dados
      fetch("/api/secretarias")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!cancelled && data?.secretarias && Array.isArray(data.secretarias)) {
            setSecretarias((prev) => {
              const combined = Array.from(new Set([...prev, ...data.secretarias])).sort((a, b) =>
                a.localeCompare(b, "pt-BR")
              );
              try {
                localStorage.setItem("licitflow_custom_locations", JSON.stringify(combined));
              } catch {}
              return combined;
            });
          }
        })
        .catch(() => {});

      // Buscar cidades do IBGE com cache em sessionStorage
      try {
        const cached = sessionStorage.getItem("licitflow_cities_v2");
        if (cached) {
          if (!cancelled) {
            setCities(JSON.parse(cached));
            setLoading(false);
          }
          return;
        }

        const response = await fetch("https://servicodados.ibge.gov.br/api/v1/localidades/municipios");
        const data = await response.json();

        const formatted = data
          .map((city: any) => {
            const uf =
              city.microrregiao?.mesorregiao?.UF?.sigla ||
              city["regiao-imediata"]?.["regiao-intermediaria"]?.UF?.sigla ||
              "";
            return `${city.nome} - ${uf}`;
          })
          .sort((a: string, b: string) => a.localeCompare(b, "pt-BR"));

        if (!cancelled) {
          setCities(formatted);
          sessionStorage.setItem("licitflow_cities_v2", JSON.stringify(formatted));
        }
      } catch (error) {
        console.error("Falha ao carregar cidades do IBGE:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  // 2. Fechar ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Normalização para busca
  const normalize = (str: string) =>
    str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  const normQuery = normalize(query);

  // Filtrar secretarias
  const filteredSecretarias =
    normQuery === ""
      ? secretarias.slice(0, 50)
      : secretarias.filter((sec) => normalize(sec).includes(normQuery)).slice(0, 50);

  // Filtrar cidades
  const filteredCities =
    normQuery === ""
      ? cities.slice(0, 50)
      : cities.filter((city) => normalize(city).includes(normQuery)).slice(0, 50);

  // Verifica se o texto digitado já existe exatamente em alguma secretaria ou cidade
  const exactMatchExists =
    normQuery !== "" &&
    (secretarias.some((s) => normalize(s) === normQuery) ||
      cities.some((c) => normalize(c) === normQuery));

  const registerSecretaria = async (nome: string) => {
    const trimmed = nome.trim();
    if (!trimmed) return;

    // Atualiza estado local e localStorage
    setSecretarias((prev) => {
      if (prev.includes(trimmed)) return prev;
      const updated = [trimmed, ...prev];
      try {
        localStorage.setItem("licitflow_custom_locations", JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Envia ao backend em background
    fetch("/api/secretarias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: trimmed }),
    }).catch((err) => console.error("Erro ao salvar secretaria no servidor:", err));
  };

  const handleSelect = (item: string) => {
    onChange(item);
    setQuery("");
    setIsOpen(false);
  };

  const handleCreateAndSelect = (customName: string) => {
    const trimmed = customName.trim();
    if (!trimmed) return;
    registerSecretaria(trimmed);
    onChange(trimmed);
    setQuery("");
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!normQuery) return;

      if (filteredSecretarias.length > 0 && normalize(filteredSecretarias[0]) === normQuery) {
        handleSelect(filteredSecretarias[0]);
      } else if (filteredCities.length > 0 && normalize(filteredCities[0]) === normQuery) {
        handleSelect(filteredCities[0]);
      } else {
        // Cria e seleciona o texto digitado
        handleCreateAndSelect(query);
      }
    }
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      {/* Valor selecionado */}
      {value ? (
        <div
          className="flex items-center justify-between w-full px-3 py-2 bg-primary/10 border border-primary/20 rounded-xl text-xs text-foreground font-semibold cursor-pointer group transition-all hover:bg-primary/15"
          onClick={() => {
            setIsOpen(true);
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
        >
          <div className="flex items-center gap-2 truncate">
            <Building2 size={14} className="text-primary shrink-0" />
            <span className="truncate">{value}</span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
              setQuery("");
              setTimeout(() => {
                setIsOpen(true);
                inputRef.current?.focus();
              }, 50);
            }}
            className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded-full hover:bg-destructive/10 cursor-pointer"
            title="Limpar seleção"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 pr-8 placeholder:text-muted-foreground font-text"
            placeholder={loading ? "Carregando cidades e secretarias..." : placeholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <div className="absolute right-2.5 top-2.5 text-muted-foreground pointer-events-none">
            {loading ? <Loader2 size={14} className="animate-spin text-primary" /> : <ChevronDown size={14} />}
          </div>
        </div>
      )}

      {/* Menu Dropdown */}
      {isOpen && !value && (
        <div className="absolute z-[80] w-full mt-1 bg-card border border-border rounded-xl shadow-2xl max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-1 custom-scrollbar">
          {/* Opção para adicionar o texto digitado como nova secretaria se não for um match exato */}
          {query.trim().length > 1 && !exactMatchExists && (
            <div
              onClick={() => handleCreateAndSelect(query)}
              className="p-2.5 bg-primary/10 hover:bg-primary/20 text-primary border-b border-border cursor-pointer transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-2 font-semibold text-xs truncate">
                <Plus size={15} className="shrink-0 text-primary" />
                <span className="truncate">Adicionar &ldquo;{query.trim()}&rdquo;</span>
              </div>
              <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-primary text-primary-foreground shrink-0 ml-2">
                Nova Secretaria
              </span>
            </div>
          )}

          {filteredSecretarias.length === 0 && filteredCities.length === 0 && !query.trim() && (
            <div className="px-3 py-4 text-center text-xs text-muted-foreground font-text">
              Nenhuma localidade encontrada. Digite o nome de uma cidade ou secretaria.
            </div>
          )}

          {/* Secretarias cadastradas */}
          {filteredSecretarias.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-muted/60 flex items-center gap-1.5">
                <Building2 size={12} className="text-primary" />
                <span>Secretarias & Órgãos Cadastrados</span>
              </div>
              <ul>
                {filteredSecretarias.map((sec) => (
                  <li
                    key={sec}
                    onClick={() => handleSelect(sec)}
                    className="px-3 py-2 text-xs text-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors flex items-center justify-between font-text"
                  >
                    <span className="truncate">{sec}</span>
                    <span className="text-[9px] text-muted-foreground uppercase font-semibold shrink-0 ml-2">
                      Secretaria
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Cidades (IBGE) */}
          {filteredCities.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-muted/60 flex items-center gap-1.5 border-t border-border">
                <MapPin size={12} className="text-muted-foreground" />
                <span>Cidades (IBGE)</span>
              </div>
              <ul>
                {filteredCities.map((city) => (
                  <li
                    key={city}
                    onClick={() => handleSelect(city)}
                    className="px-3 py-2 text-xs text-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors flex items-center justify-between font-text"
                  >
                    <span className="truncate">{city}</span>
                    <span className="text-[9px] text-muted-foreground uppercase font-semibold shrink-0 ml-2">
                      Cidade
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
