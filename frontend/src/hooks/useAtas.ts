"use client";

import { useState, useEffect } from "react";
import { useBrand } from "@/context/BrandContext";

export interface Ata {
  id: string;
  number: string;
  organ: string;
  description: string;
  createdAt: string;
}

export interface RepresentanteAta {
  id: string;
  ataId: string;
  name: string;
  region: string;
  waitingDeadline: string; // "DD/MM/YYYY"
  status: "waiting_letter" | "expired" | "active" | "waitlist";
}

export interface OficioRecebido {
  id: string;
  ataId: string;
  representanteName: string;
  region: string;
  fileName: string;
  sentAt: string;
  status: "pending" | "approved" | "rejected";
}

export interface AutorizacaoAdesao {
  id: string;
  ataId: string;
  representanteName: string;
  region: string;
  documentNumber: string;
  issuedAt: string;
}

const MOCK_ATAS: Ata[] = [
  {
    id: "ata-001",
    number: "GREAL ATA 001/2026",
    organ: "Prefeitura de São José dos Campos",
    description: "Fornecimento de parquinhos infantis modulares e playgrounds",
    createdAt: "15/01/2026",
  },
  {
    id: "ata-002",
    number: "GREAL ATA 002/2026",
    organ: "Secretaria Estadual de Educação - SP",
    description: "Playgrounds modulares com telhado e balanço",
    createdAt: "01/02/2026",
  },
  {
    id: "ata-012",
    number: "ATA SIMPLIFICADA 012/2025",
    organ: "Consórcio Intermunicipal do Litoral",
    description: "Equipamentos de ginástica ao ar livre e recreação",
    createdAt: "10/11/2025",
  },
  {
    id: "ata-015",
    number: "ATA SIMPLIFICADA 015/2026",
    organ: "Prefeitura de Pouso Alegre - MG",
    description: "Brinquedos de inclusão e acessibilidade para praças",
    createdAt: "20/02/2026",
  },
];

const MOCK_REPRESENTANTES: RepresentanteAta[] = [
  {
    id: "rep-1",
    ataId: "ata-001",
    name: "Roberto Silva Representações",
    region: "Vale do Paraíba - SP",
    waitingDeadline: "04/06/2026",
    status: "expired",
  },
  {
    id: "rep-2",
    ataId: "ata-001",
    name: "Ana Paula Souza & Cia",
    region: "Campinas - SP",
    waitingDeadline: "06/06/2026",
    status: "expired",
  },
  {
    id: "rep-3",
    ataId: "ata-012",
    name: "Carlos Eduardo Dist. Ltda",
    region: "Litoral Norte - SP",
    waitingDeadline: "08/06/2026",
    status: "expired",
  },
  {
    id: "rep-4",
    ataId: "ata-002",
    name: "Julio Cesar Representações",
    region: "Vale do Paraíba - SP",
    waitingDeadline: "13/06/2026",
    status: "waiting_letter",
  },
  {
    id: "rep-5",
    ataId: "ata-015",
    name: "Mariana Costa Negócios",
    region: "Sul de Minas - MG",
    waitingDeadline: "16/06/2026",
    status: "waiting_letter",
  },
];

const MOCK_OFICIOS: OficioRecebido[] = [
  {
    id: "oficio-1",
    ataId: "ata-001",
    representanteName: "Roberto Silva Representações",
    region: "Vale do Paraíba - SP",
    fileName: "oficio_roberto_silva_assinado.pdf",
    sentAt: "03/06/2026",
    status: "pending",
  },
  {
    id: "oficio-2",
    ataId: "ata-002",
    representanteName: "Julio Cesar Representações",
    region: "Vale do Paraíba - SP",
    fileName: "solicitacao_adesao_julio_cesar.pdf",
    sentAt: "08/06/2026",
    status: "pending",
  },
];

const MOCK_AUTORIZACOES: AutorizacaoAdesao[] = [
  {
    id: "aut-1",
    ataId: "ata-001",
    representanteName: "José Vendedor Exemplo",
    region: "Belo Horizonte - MG",
    documentNumber: "AUT-2026-0089",
    issuedAt: "10/05/2026",
  },
];

const PLAY_MOCK_ATAS: Ata[] = [
  {
    id: "ata-play-001",
    number: "PLAY ATA 005/2026",
    organ: "Prefeitura de Campinas",
    description: "Adesão para fornecimento de brinquedos infantis acessíveis e playgrounds modulares adaptados",
    createdAt: "12/03/2026",
  },
  {
    id: "ata-play-002",
    number: "PLAY ATA 087/2025",
    organ: "Secretaria de Esportes e Lazer - SP",
    description: "Estruturas de madeira tratada autoclavada para parquinho infantil (balanços, escorregadores, gangorras e casinhas de tarzan)",
    createdAt: "05/12/2025",
  },
  {
    id: "ata-play-003",
    number: "PLAY ATA SIMPLIFICADA 003/2026",
    organ: "Prefeitura de São José dos Campos",
    description: "Pisos emborrachados de segurança, amortecedores de impacto e grama sintética para playgrounds escolares",
    createdAt: "18/01/2026",
  },
];

const PLAY_MOCK_REPRESENTANTES: RepresentanteAta[] = [
  {
    id: "rep-play-1",
    ataId: "ata-play-001",
    name: "Playground Brasil Dist. Ltda",
    region: "Vale do Paraíba - SP",
    waitingDeadline: "04/08/2026",
    status: "active",
  },
  {
    id: "rep-play-2",
    ataId: "ata-play-001",
    name: "Carlos Eduardo Balanços",
    region: "Campinas - SP",
    waitingDeadline: "15/07/2026",
    status: "waiting_letter",
  },
  {
    id: "rep-play-3",
    ataId: "ata-play-002",
    name: "Recrear Parques & Lazer",
    region: "Litoral Norte - SP",
    waitingDeadline: "10/06/2026",
    status: "expired",
  },
];

const PLAY_MOCK_OFICIOS: OficioRecebido[] = [
  {
    id: "oficio-play-1",
    ataId: "ata-play-001",
    representanteName: "Carlos Eduardo Balanços",
    region: "Campinas - SP",
    fileName: "oficio_solicitacao_carlos_balancos.pdf",
    sentAt: "14/07/2026",
    status: "pending",
  },
];

const PLAY_MOCK_AUTORIZACOES: AutorizacaoAdesao[] = [
  {
    id: "aut-play-1",
    ataId: "ata-play-001",
    representanteName: "Playground Brasil Dist. Ltda",
    region: "Vale do Paraíba - SP",
    documentNumber: "AUT-2026-PLAY001",
    issuedAt: "10/05/2026",
  },
];

export function useAtas() {
  const { brand } = useBrand();
  const [atas, setAtas] = useState<Ata[]>([]);
  const [representantes, setRepresentantes] = useState<RepresentanteAta[]>([]);
  const [oficios, setOficios] = useState<OficioRecebido[]>([]);
  const [autorizacoes, setAutorizacoes] = useState<AutorizacaoAdesao[]>([]);
  const [loading, setLoading] = useState(true);

  const prefix = brand === "play" ? "play_" : "esporte_";

  useEffect(() => {
    setLoading(true);
    // Load from localStorage if exists, otherwise load mocks
    const storedAtas = localStorage.getItem(`${prefix}licitflow_atas`);
    const storedReps = localStorage.getItem(`${prefix}licitflow_representantes`);
    const storedOficios = localStorage.getItem(`${prefix}licitflow_oficios`);
    const storedAuts = localStorage.getItem(`${prefix}licitflow_autorizacoes`);

    const currentMockAtas = brand === "play" ? PLAY_MOCK_ATAS : MOCK_ATAS;
    const currentMockReps = brand === "play" ? PLAY_MOCK_REPRESENTANTES : MOCK_REPRESENTANTES;
    const currentMockOficios = brand === "play" ? PLAY_MOCK_OFICIOS : MOCK_OFICIOS;
    const currentMockAuts = brand === "play" ? PLAY_MOCK_AUTORIZACOES : MOCK_AUTORIZACOES;

    if (storedAtas) {
      setAtas(JSON.parse(storedAtas));
    } else {
      setAtas(currentMockAtas);
      localStorage.setItem(`${prefix}licitflow_atas`, JSON.stringify(currentMockAtas));
    }

    if (storedReps) {
      setRepresentantes(JSON.parse(storedReps));
    } else {
      setRepresentantes(currentMockReps);
      localStorage.setItem(`${prefix}licitflow_representantes`, JSON.stringify(currentMockReps));
    }

    if (storedOficios) {
      setOficios(JSON.parse(storedOficios));
    } else {
      setOficios(currentMockOficios);
      localStorage.setItem(`${prefix}licitflow_oficios`, JSON.stringify(currentMockOficios));
    }

    if (storedAuts) {
      setAutorizacoes(JSON.parse(storedAuts));
    } else {
      setAutorizacoes(currentMockAuts);
      localStorage.setItem(`${prefix}licitflow_autorizacoes`, JSON.stringify(currentMockAuts));
    }

    setLoading(false);
  }, [brand, prefix]);

  const saveAtas = (newAtas: Ata[]) => {
    setAtas(newAtas);
    localStorage.setItem(`${prefix}licitflow_atas`, JSON.stringify(newAtas));
  };

  const saveReps = (newReps: RepresentanteAta[]) => {
    setRepresentantes(newReps);
    localStorage.setItem(`${prefix}licitflow_representantes`, JSON.stringify(newReps));
  };

  const saveOficios = (newOficios: OficioRecebido[]) => {
    setOficios(newOficios);
    localStorage.setItem(`${prefix}licitflow_oficios`, JSON.stringify(newOficios));
  };

  const saveAuts = (newAuts: AutorizacaoAdesao[]) => {
    setAutorizacoes(newAuts);
    localStorage.setItem(`${prefix}licitflow_autorizacoes`, JSON.stringify(newAuts));
  };

  const addAta = (number: string, organ: string, description: string) => {
    const newAta: Ata = {
      id: `ata-${Date.now()}`,
      number,
      organ,
      description,
      createdAt: new Date().toLocaleDateString("pt-BR"),
    };
    const updated = [newAta, ...atas];
    saveAtas(updated);
    return newAta;
  };

  const addRepresentante = (ataId: string, name: string, region: string, waitingDays = 30) => {
    // Check if region already has representative for this ata
    const duplicated = representantes.filter(
      (r) => r.ataId === ataId && r.region.toLowerCase() === region.toLowerCase() && r.status !== "expired"
    );

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + waitingDays);
    const deadlineStr = targetDate.toLocaleDateString("pt-BR");

    const newRep: RepresentanteAta = {
      id: `rep-${Date.now()}`,
      ataId,
      name,
      region,
      waitingDeadline: deadlineStr,
      status: duplicated.length > 0 ? "waitlist" : "waiting_letter",
    };

    const updated = [...representantes, newRep];
    saveReps(updated);

    return {
      success: true,
      representative: newRep,
      duplicated: duplicated.length > 0 ? duplicated : null,
    };
  };

  const uploadOficio = (ataId: string, representanteName: string, region: string, fileName: string) => {
    const newOficio: OficioRecebido = {
      id: `oficio-${Date.now()}`,
      ataId,
      representanteName,
      region,
      fileName,
      sentAt: new Date().toLocaleDateString("pt-BR"),
      status: "pending",
    };
    const updated = [newOficio, ...oficios];
    saveOficios(updated);
    return newOficio;
  };

  const approveOficio = (oficioId: string) => {
    const updatedOficios = oficios.map((o) => {
      if (o.id === oficioId) {
        return { ...o, status: "approved" as const };
      }
      return o;
    });
    saveOficios(updatedOficios);

    const approvedOficio = oficios.find((o) => o.id === oficioId);
    if (approvedOficio) {
      // Set representative as active
      const updatedReps = representantes.map((r) => {
        if (r.name === approvedOficio.representanteName && r.ataId === approvedOficio.ataId && r.region === approvedOficio.region) {
          return { ...r, status: "active" as const };
        }
        return r;
      });
      saveReps(updatedReps);

      // Create authorization
      const newAut: AutorizacaoAdesao = {
        id: `aut-${Date.now()}`,
        ataId: approvedOficio.ataId,
        representanteName: approvedOficio.representanteName,
        region: approvedOficio.region,
        documentNumber: `AUT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        issuedAt: new Date().toLocaleDateString("pt-BR"),
      };
      saveAuts([newAut, ...autorizacoes]);
    }
  };

  return {
    atas,
    representantes,
    oficios,
    autorizacoes,
    loading,
    addAta,
    addRepresentante,
    uploadOficio,
    approveOficio,
  };
}
