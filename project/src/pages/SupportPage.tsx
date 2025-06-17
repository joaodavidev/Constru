import React, { useEffect, useState } from 'react';

export default function SupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any|null>(null);
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [abrindoTicket, setAbrindoTicket] = useState(false);
  const [erro, setErro] = useState<string|null>(null);
  const usuario_id = localStorage.getItem('userId') || 1; // TODO: pegar do contexto de auth

  // Buscar tickets do usuário
  useEffect(() => {
    setLoadingTickets(true);
    fetch(`http://localhost:3001/suporte/tickets?usuario_id=${usuario_id}`)
      .then(res => res.json())
      .then(data => setTickets(Array.isArray(data) ? data : []))
      .catch(() => setTickets([]))
      .finally(() => setLoadingTickets(false));
  }, [usuario_id]);

  // Buscar mensagens do ticket selecionado
  useEffect(() => {
    if (!selectedTicket) return;
    fetch(`http://localhost:3001/suporte/mensagens?ticket_id=${selectedTicket.id}`)
      .then(res => res.json())
      .then(data => setMensagens(Array.isArray(data) ? data : []))
      .catch(() => setMensagens([]));
  }, [selectedTicket]);

  // Abrir novo ticket
  const abrirTicket = async () => {
    setAbrindoTicket(true);
    setErro(null);
    try {
      const res = await fetch('http://localhost:3001/suporte/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id })
      });
      if (!res.ok) throw new Error('Erro ao abrir ticket');
      const ticket = await res.json();
      setTickets(t => [ticket, ...t]);
      setSelectedTicket(ticket);
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setAbrindoTicket(false);
    }
  };

  // Enviar mensagem
  const enviarMensagem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaMensagem.trim() || !selectedTicket) return;
    setEnviando(true);
    setErro(null);
    try {
      const res = await fetch('http://localhost:3001/suporte/mensagens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticket_id: selectedTicket.id,
          remetente_id: usuario_id,
          mensagem: novaMensagem
        })
      });
      if (!res.ok) throw new Error('Erro ao enviar mensagem');
      setNovaMensagem('');
      // reload mensagens
      fetch(`http://localhost:3001/suporte/mensagens?ticket_id=${selectedTicket.id}`)
        .then(res => res.json())
        .then(data => setMensagens(Array.isArray(data) ? data : []));
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="container py-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-semibold mb-6">Suporte ao Usuário</h1>
      <div className="mb-6 flex gap-4">
        <button className="btn btn-primary" onClick={abrirTicket} disabled={abrindoTicket}>
          {abrindoTicket ? 'Abrindo...' : 'Abrir novo chamado'}
        </button>
        {erro && <span className="text-red-500">{erro}</span>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Lista de tickets */}
        <div className="col-span-1">
          <h2 className="text-lg font-semibold mb-2">Seus chamados</h2>
          {loadingTickets ? (
            <div>Carregando...</div>
          ) : tickets.length === 0 ? (
            <div className="text-gray-500">Nenhum chamado aberto.</div>
          ) : (
            <ul className="space-y-2">
              {tickets.map(ticket => (
                <li key={ticket.id}>
                  <button
                    className={`w-full text-left p-2 rounded ${selectedTicket && selectedTicket.id === ticket.id ? 'bg-primary text-white' : 'bg-gray-100'}`}
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    #{ticket.id} - {ticket.status}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Mensagens do ticket */}
        <div className="col-span-2">
          {selectedTicket ? (
            <div>
              <h3 className="font-semibold mb-2">Ticket #{selectedTicket.id} - {selectedTicket.status}</h3>
              <div className="bg-gray-50 rounded p-3 h-64 overflow-y-auto mb-3 flex flex-col gap-2">
                {mensagens.length === 0 ? (
                  <div className="text-gray-500">Nenhuma mensagem ainda.</div>
                ) : (
                  mensagens.map(msg => (
                    <div key={msg.id} className="flex flex-col">
                      <span className="text-sm font-medium">{msg.remetente_nome || 'Usuário'}</span>
                      <span className="text-gray-700">{msg.mensagem}</span>
                      <span className="text-xs text-gray-400">{new Date(msg.enviada_em).toLocaleString()}</span>
                    </div>
                  ))
                )}
              </div>
              <form onSubmit={enviarMensagem} className="flex gap-2">
                <input
                  className="flex-1 border rounded p-2"
                  placeholder="Digite sua mensagem..."
                  value={novaMensagem}
                  onChange={e => setNovaMensagem(e.target.value)}
                  disabled={enviando}
                />
                <button className="btn btn-primary" type="submit" disabled={enviando || !novaMensagem.trim()}>
                  {enviando ? 'Enviando...' : 'Enviar'}
                </button>
              </form>
            </div>
          ) : (
            <div className="text-gray-500">Selecione um chamado para ver as mensagens.</div>
          )}
        </div>
      </div>
    </div>
  );
}
