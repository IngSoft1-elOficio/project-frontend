import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import PlayersList from "../components/PlayersList";
import Card from "../components/Card";
import Button from "../components/Button";


import { useAppContext } from "../context/AppContext";

export default function GameJoin() {
  const { usuarios , game_id } = useAppContext();
  //supongamos dispacth ADD_USUARIO es  [{ user_id: "26", nombre: "yo", avatar: "/img1.png", host: true } , {...} ]
  const hostUser = usuarios.find(u => u.host === true);
  const host_id = hostUser.user_id ;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('waiting');

  useEffect () => {
    const onParticipants = PlayersList (usuarios,host_id);


  };




  useEffect(() => {
    if (status === "started") navigate(`/game/${game_id}`);
  }, [status, id, navigate]);

  const handleStart = () => {
    if (!hostUser) return;
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
