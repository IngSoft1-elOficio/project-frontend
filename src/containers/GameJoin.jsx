import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PlayersList from "./PlayersList";
import Card from "./Card";
import Button from "./Button";

import { getGameMock } from "../mocks/game";
import { mockSubscribeToGame } from "../mocks/realtime";

export default function GameJoin() {
  const id = 123;
  const navigate = useNavigate();

  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gameName, setGameName] = useState("");
  const [ownerId, setOwnerId] = useState(null);
  const [status, setStatus] = useState("waiting");

  const currentUserId = null;
  const isOwner = Boolean(ownerId) && currentUserId === ownerId;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await getGameMock(id);
      if (cancelled) return;

      setGameName(data?.name ?? "");
      setOwnerId(data?.ownerId ?? null);
      setPlayers(Array.isArray(data?.players) ? data.players : []);
      setStatus(data?.status ?? "waiting");
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const unsubscribe = mockSubscribeToGame(id, (newPlayer) => {
      if (!newPlayer?.id) return;
      setPlayers((prev) =>
        prev.some((p) => p.id === newPlayer.id) ? prev : [...prev, newPlayer]
      );
    });
    return unsubscribe;
  }, [id]);

  useEffect(() => {
    if (status === "started") navigate(`/game/${id}`);
  }, [status, id, navigate]);

  if (loading) {
    return (
      <div className="min-h-dvh grid place-items-center bg-[#2a0500]">
        <h1 className="text-[#F4CC6F] text-xl">Cargando sala…</h1>
      </div>
    );
  }

  const handleStart = () => {
    if (!isOwner) return; // guardia extra
    setStatus("started");
  };

  return (
    <main className="relative min-h-dvh overflow-x-hidden">
      {/* Fondo desde /public */}
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
