// Mock del GET /game/:id 
export async function getGameMock(id) {
  await new Promise(r => setTimeout(r, 300));
  return {
    id,
    name: "Famaf",
    ownerId: "32",
    status: "waiting",
    players: [
      { id: "32", name: "yo" },
    ],
  };
}
