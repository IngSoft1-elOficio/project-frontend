import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PlayersList from "../components/PlayersList";
import Card from "../components/Card";
import Button from "../components/Button";

import { getGameMock } from "../mocks/game";
import { socket, bootMockRealtime } from "../mocks/realtime";

export default function GameJoin() {
  const id = 123; //reemplazar por useParams
  const currentUserId = "32"; //pedir del local.storage
  const navigate = useNavigate();

  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gameName, setGameName] = useState("");
  const [ownerId, setOwnerId] = useState(null);
  const [status, setStatus] = useState("waiting");

  const isOwner = ownerId != null && currentUserId === ownerId;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await getGameMock(id); //remplazar por await fetch
      if (cancelled) return;

      setGameName(data.name);
      setOwnerId(data.ownerId);
      setStatus(data.status);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    if (!id || !currentUserId) return;

    bootMockRealtime({ gameId: id, userId: currentUserId });

    const onParticipants = ({ participants_list }) => {
      setPlayers((participants_list ?? []).map(p => ({ id: String(p.user_id) })));
    };

    const onPlayerConnected = ({ user_id, game_id }) => {
      if (String(game_id) !== String(id)) return;
      setPlayers(prev =>
        prev.some(p => String(p.id) === String(user_id))
          ? prev
          : [...prev, { id: String(user_id) }]
      );
    };

    socket.on("get_participants", onParticipants);
    socket.on("player_connected", onPlayerConnected);

    return () => {
      socket.off("get_participants", onParticipants);
      socket.off("player_connected", onPlayerConnected);
    
    };
  }, [id, currentUserId]);

  
  useEffect(() => {
    if (status === "started") navigate(`/game/${id}`);
  }, [status, id, navigate]);

  const handleStart = () => {
    if (!isOwner) return;
    setStatus("started");
  };

  if (loading) {
    return (
      <div className="min-h-dvh grid place-items-center bg-[#2a0500]">
        <h1 className="text-[#F4CC6F] text-xl">Cargando sala…</h1>
      </div>
    );
  }

  return (
    <main className="relative min-h-dvh overflow-x-hidden">
      <div
        className="fixed inset-0 z-0 bg-[url('/background.png')] bg-cover bg-center"
        aria-hidden
      />
      <div className="relative z-10 mx-auto max-w-3xl px-4 py-10">
        <h1 className="mb-6 text-3xl font-bold text-[#F4CC6F]">
          Partida: <span className="font-black">{gameName || "Sin nombre"}</span>
        </h1>

        <Card title="Jugadores" className="mb-8">
          <PlayersList players={players} ownerId={ownerId} />
        </Card>

        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20">
          <Button onClick={handleStart} disabled={!isOwner}>
            Iniciar partida
          </Button>
        </div>
      </div>
    </main>
  );
}
