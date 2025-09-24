import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import PlayersList from "../components/PlayersList";
import Card from "../components/Card";
import Button from "../components/Button";

export default function GameJoin() {
  const { gameId } = useParams();
  const { usuarios , game_id } = useAppContext();
  //supongamos dispacth ADD_USUARIO es  [{ user_id: "26", nombre: "yo", avatar: "/img1.png", host: true } , {...} ]
  const hostUser = usuarios.find(u => u.host === true);
  const host_id = hostUser?.user_id ;
  const navigate = useNavigate();


  const handleStart = async () => {
    if (!hostUser) return;

    try {
      const response = await fetch(`http://localhost:8000/game/${game_id}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: hostUser.user_id })
      });

      if (!response.ok) {
        throw new Error("Error al iniciar partida");
      }

    } catch (error) {
      console.error("Fallo en handleStart:", error);
    }
  };



return (
  <main className="relative min-h-dvh overflow-x-hidden">
    <div
      className="fixed inset-0 z-0 bg-[url('/background.png')] bg-cover bg-center"
      aria-hidden
    />
    <div className="relative z-10 mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold text-[#F4CC6F] font-limelight">
        Partida: <span className="font-black">{game_id || "Sin nombre"}</span>
      </h1>

      <Card title="Jugadores" className="mb-8 font-limelight">
        <PlayersList players={usuarios} hostId={host_id} />
      </Card>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20">
        <Button onClick={handleStart} disabled={!hostUser} className="font-limelight">
          Iniciar partida
        </Button>
      </div>
    </div>
  </main>
);
}

