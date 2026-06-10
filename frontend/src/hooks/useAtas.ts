"use client";

import { useState, useEffect } from "react";

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

export function useAtas() {
  const [atas, setAtas] = useState<Ata[]>([]);
  const [representantes, setRepresentantes] = useState<RepresentanteAta[]>([]);
  const [oficios, setOficios] = useState<OficioRecebido[]>([]);
  const [autorizacoes, setAutorizacoes] = useState<AutorizacaoAdesao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load from localStorage if exists, otherwise load mocks
    const storedAtas = localStorage.getItem("licitflow_atas");
    const storedReps = localStorage.getItem("licitflow_representantes");
    const storedOficios = localStorage.getItem("licitflow_oficios");
    const storedAuts = localStorage.getItem("licitflow_autorizacoes");

    if (storedAtas) {
      setAtas(JSON.parse(storedAtas));
    } else {
      setAtas(MOCK_ATAS);
      localStorage.setItem("licitflow_atas", JSON.stringify(MOCK_ATAS));
    }

    if (storedReps) {
      setRepresentantes(JSON.parse(storedReps));
    } else {
      setRepresentantes(MOCK_REPRESENTANTES);
      localStorage.setItem("licitflow_representantes", JSON.stringify(MOCK_REPRESENTANTES));
    }

    if (storedOficios) {
      setOficios(JSON.parse(storedOficios));
    } else {
      setOficios(MOCK_OFICIOS);
      localStorage.setItem("licitflow_oficios", JSON.stringify(MOCK_OFICIOS));
    }

    if (storedAuts) {
      setAutorizacoes(JSON.parse(storedAuts));
    } else {
      setAutorizacoes(MOCK_AUTORIZACOES);
      localStorage.setItem("licitflow_autorizacoes", JSON.stringify(MOCK_AUTORIZACOES));
    }

    setLoading(false);
  }, []);

  const saveAtas = (newAtas: Ata[]) => {
    setAtas(newAtas);
    localStorage.setItem("licitflow_atas", JSON.stringify(newAtas));
  };

  const saveReps = (newReps: RepresentanteAta[]) => {
    setRepresentantes(newReps);
    localStorage.setItem("licitflow_representantes", JSON.stringify(newReps));
  };

  const saveOficios = (newOficios: OficioRecebido[]) => {
    setOficios(newOficios);
    localStorage.setItem("licitflow_oficios", JSON.stringify(newOficios));
  };

  const saveAuts = (newAuts: AutorizacaoAdesao[]) => {
    setAutorizacoes(newAuts);
    localStorage.setItem("licitflow_autorizacoes", JSON.stringify(newAuts));
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
