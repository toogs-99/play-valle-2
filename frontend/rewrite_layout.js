const fs = require('fs');

const targetPath = 'src/app/(dashboard)/atas/[id]/page.tsx';
let content = fs.readFileSync(targetPath, 'utf8');

const startMarker = '{/* Tabs Switcher Navigation */}';
const endMarker = '    </div>\n  );\n}';

if (!content.includes(startMarker) || !content.includes(endMarker)) {
    console.error('Markers not found!');
    process.exit(1);
}

const beforeContent = content.substring(0, content.indexOf(startMarker));

const newLayout = `{/* Layout Content: Sidebar and Tab Content */}
      <div className="flex flex-col md:flex-row gap-8 mt-8">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-2">
          <button
            onClick={() => setActiveTab("representantes")}
            className={\`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-xs transition-colors \${
              activeTab === "representantes"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                : "bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            }\`}
          >
            <Users size={16} />
            Representantes
          </button>

          <button
            onClick={() => setActiveTab("modelo")}
            className={\`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-xs transition-colors \${
              activeTab === "modelo"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                : "bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            }\`}
          >
            <FileText size={16} />
            Modelo de Ofício
          </button>

          <button
            onClick={() => setActiveTab("oficios")}
            className={\`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-xs transition-colors \${
              activeTab === "oficios"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                : "bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            }\`}
          >
            <div className="flex items-center gap-3 flex-1">
              <Send size={16} />
              Ofícios Recebidos
            </div>
            {filteredOficios.filter((o) => o.status === "pending").length > 0 && (
              <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("autorizacoes")}
            className={\`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-xs transition-colors \${
              activeTab === "autorizacoes"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                : "bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            }\`}
          >
            <UserCheck size={16} />
            Autorização de Adesão
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          
          {/* Tab 1: REPRESENTANTES */}
          {activeTab === "representantes" && (
            <div className="bg-white border border-slate-150 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/10">
                <div>
                  <span className="text-xs font-bold text-slate-700 block">Representantes Cadastrados</span>
                  <span className="text-[10px] text-slate-400 font-medium">{filteredReps.length} no total</span>
                </div>
                <button
                  onClick={() => setIsRepModalOpen(true)}
                  className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[10px] px-3 py-2 rounded-lg transition-colors"
                >
                  <Plus size={14} /> Novo Vendedor
                </button>
              </div>

              {filteredReps.length === 0 ? (
                <div className="p-10 text-center text-slate-400 space-y-2">
                  <Users size={24} className="mx-auto text-slate-300" />
                  <p className="text-xs">Nenhum vendedor cadastrado nesta Ata.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-450 uppercase">
                        <th className="p-4">Vendedor</th>
                        <th className="p-4">Cidade</th>
                        <th className="p-4">Prazo Ofício</th>
                        <th className="p-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredReps.map((rep) => (
                        <tr key={rep.id} className="hover:bg-slate-50/30 transition-colors">
                          <td className="p-4 font-semibold text-slate-800">{rep.name}</td>
                          <td className="p-4 text-slate-500">{rep.region}</td>
                          <td className="p-4 text-slate-500 flex items-center gap-1">
                            <Calendar size={12} className="text-slate-400" />
                            {rep.waitingDeadline}
                          </td>
                          <td className="p-4 text-right">
                            <span className={\`text-[9px] px-2 py-0.5 rounded-full font-semibold \${getStatusBadge(rep.status)}\`}>
                              {getStatusLabel(rep.status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: MODELO DE OFÍCIO */}
          {activeTab === "modelo" && (
            <div className="bg-white border border-slate-150 rounded-2xl shadow-sm p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-sm text-slate-800">Modelo Oficial para Adesão</h3>
                  <p className="text-slate-500 text-[10px] mt-0.5">
                    Copie o texto base abaixo para que o representante envie a formalização de cota.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={copyTemplateToClipboard}
                    className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs px-3.5 py-2 rounded-xl transition-all border border-indigo-150 shadow-sm"
                  >
                    {copied ? <Check size={14} className="text-indigo-650" /> : <ClipboardCheck size={14} />}
                    {copied ? "Copiado!" : "Copiar Modelo"}
                  </button>
                  <button
                    onClick={() => {
                      const blob = new Blob([getLetterTemplate()], { type: "text/plain;charset=utf-8" });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = \`Modelo_Oficio_Adesao_\${activeAta.number.replace(/\\//g, "-")}.txt\`;
                      link.click();
                    }}
                    className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition-all shadow-sm"
                  >
                    <Download size={14} />
                    Baixar .TXT
                  </button>
                </div>
              </div>

              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-150 font-mono text-xs text-slate-700 leading-relaxed whitespace-pre-wrap select-all relative group">
                <pre id="oficio-template-text" className="font-sans leading-loose text-slate-650">
                  {getLetterTemplate()}
                </pre>
              </div>

              <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 text-xxs text-indigo-950 flex gap-3 items-start">
                <FileText size={16} className="text-indigo-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold">Como funciona a formalização?</p>
                  <p className="text-indigo-750/80 leading-relaxed mt-0.5">
                    O vendedor deve copiar o texto base acima, preencher com seus dados societários e da cidade reservada, assinar digitalmente e nos enviar (enviar arquivo em PDF). Após o recebimento, anexe o documento na aba <strong>Ofícios Recebidos</strong> para homologar a cota e emitir a Autorização de Adesão.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: OFÍCIOS RECEBIDOS */}
          {activeTab === "oficios" && (
            <div className="bg-white border border-slate-150 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/10">
                <div>
                  <span className="text-xs font-bold text-slate-700 block">Histórico de Ofícios Recebidos</span>
                  <span className="text-[10px] text-slate-400 font-medium">Aguardando aprovação</span>
                </div>
                <button
                  onClick={() => setIsOficioModalOpen(true)}
                  className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[10px] px-3 py-2 rounded-lg transition-colors"
                >
                  <Upload size={14} /> Anexar Ofício
                </button>
              </div>

              {filteredOficios.length === 0 ? (
                <div className="p-10 text-center text-slate-400 space-y-2">
                  <Send size={24} className="mx-auto text-slate-300" />
                  <p className="text-xs">Nenhum documento de ofício recebido nesta Ata.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-455 uppercase">
                        <th className="p-4">Remetente</th>
                        <th className="p-4">Cidade</th>
                        <th className="p-4">Arquivo</th>
                        <th className="p-4">Enviado Em</th>
                        <th className="p-4 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredOficios.map((oficio) => (
                        <tr key={oficio.id} className="hover:bg-slate-50/30 transition-colors">
                          <td className="p-4 font-semibold text-slate-850">{oficio.representanteName}</td>
                          <td className="p-4 text-slate-500">{oficio.region}</td>
                          <td className="p-4 text-indigo-600 font-medium flex items-center gap-1">
                            <FileSpreadsheet size={14} className="text-slate-400" />
                            <span className="underline cursor-pointer">{oficio.fileName}</span>
                          </td>
                          <td className="p-4 text-slate-450">{oficio.sentAt}</td>
                          <td className="p-4 text-right">
                            {oficio.status === "pending" ? (
                              <button
                                onClick={() => approveOficio(oficio.id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[10px] px-2.5 py-1 rounded-lg transition-colors shadow-sm"
                              >
                                Homologar/Aprovar
                              </button>
                            ) : (
                              <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                Aprovado
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab 4: AUTORIZAÇÃO DE ADESÃO */}
          {activeTab === "autorizacoes" && (
            <div className="bg-white border border-slate-150 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/10 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-sm text-slate-800">Autorizações Emitidas</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Certificados formais gerados após aprovação do ofício.</p>
                </div>
                <span className="text-[10px] text-slate-450 font-bold bg-slate-100 px-2 py-1 rounded-lg">
                  {filteredAutorizacoes.length} Documentos
                </span>
              </div>

              {filteredAutorizacoes.length === 0 ? (
                <div className="p-12 text-center text-slate-400 space-y-2">
                  <UserCheck size={28} className="mx-auto text-slate-300" />
                  <p className="text-xs">Nenhum certificado de autorização emitido até o momento.</p>
                  <p className="text-[10px] text-slate-450 max-w-sm mx-auto">
                    Aprove um ofício anexado para gerar de forma automatizada o certificado de homologação da cota de adesão.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-450 uppercase">
                        <th className="p-4">Nº do Certificado</th>
                        <th className="p-4">Representante Autorizado</th>
                        <th className="p-4">Cidade Autorizada</th>
                        <th className="p-4">Data de Emissão</th>
                        <th className="p-4 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredAutorizacoes.map((aut) => (
                        <tr key={aut.id} className="hover:bg-slate-50/30 transition-colors">
                          <td className="p-4 font-mono font-bold text-indigo-700">{aut.documentNumber}</td>
                          <td className="p-4 font-semibold text-slate-800">{aut.representanteName}</td>
                          <td className="p-4 text-slate-500">{aut.region}</td>
                          <td className="p-4 text-slate-450 flex items-center gap-1">
                            <Calendar size={12} className="text-slate-400" />
                            {aut.issuedAt}
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => {
                                alert(\`MOCK DOWNLOAD: Baixando arquivo \${aut.documentNumber}.pdf para formalização.\`);
                              }}
                              className="text-[10px] text-indigo-650 hover:text-indigo-850 font-bold underline flex items-center gap-0.5 justify-end"
                            >
                              <Download size={11} /> Baixar Certificado
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* MODALS */}
      {isRepModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">
                Vincular Novo Vendedor
              </h3>
              <button onClick={() => setIsRepModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-50">
                <X size={16} />
              </button>
            </div>
            
            <div className="p-5">
              <form onSubmit={handleAddRep} className="space-y-4">
                {repSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-xxs font-medium flex items-center gap-1">
                    <Check size={14} />
                    <span>Representante vinculado com sucesso!</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Nome do Representante
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: João Silva Representações"
                    value={repName}
                    onChange={(e) => setRepName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Cidade Pretendida de Venda
                  </label>
                  <CityCombobox
                    value={repRegion}
                    onChange={setRepRegion}
                    placeholder="Busque a cidade (ex: São Paulo)"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Dias de Espera para o Ofício
                  </label>
                  <input
                    type="number"
                    value={repDays}
                    onChange={(e) => setRepDays(Number(e.target.value))}
                    min={1}
                    max={60}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                  <span className="text-[9px] text-slate-400 block mt-0.5">
                    Prazo em dias corridos para o envio formal do ofício.
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2 rounded-xl transition-colors mt-2"
                >
                  <Plus size={14} />
                  Cadastrar Vendedor
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {isOficioModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Upload size={14} className="text-indigo-650" /> Anexar Ofício
              </h3>
              <button onClick={() => setIsOficioModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-50">
                <X size={16} />
              </button>
            </div>
            
            <div className="p-5">
              <form onSubmit={handleUploadOficio} className="space-y-4">
                {uploadSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-xxs font-medium flex items-center gap-1">
                    <Check size={14} />
                    <span>Ofício anexado com sucesso!</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Representante Remetente
                  </label>
                  <select
                    value={uploadRepName}
                    onChange={(e) => {
                      setUploadRepName(e.target.value);
                      const matched = filteredReps.find((r) => r.name === e.target.value);
                      if (matched) setUploadRegion(matched.region);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-205 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">Selecione o vendedor...</option>
                    {filteredReps
                      .filter((r) => r.status === "waiting_letter" || r.status === "expired")
                      .map((r) => (
                        <option key={r.id} value={r.name}>
                          {r.name} ({r.region})
                        </option>
                      ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Cidade Automática
                  </label>
                  <input
                    type="text"
                    value={uploadRegion}
                    disabled
                    placeholder="Selecione o representante acima..."
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-450 focus:outline-none cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Nome do Arquivo PDF
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: oficio_assinado_sul_minas.pdf"
                    value={uploadFileName}
                    onChange={(e) => setUploadFileName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-205 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2.5 rounded-xl transition-colors mt-2"
                >
                  <Upload size={14} />
                  Anexar e Processar
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
`;

fs.writeFileSync(targetPath, beforeContent + newLayout);
console.log('Successfully updated layout.');
