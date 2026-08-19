import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { createHash, timingSafeEqual } from "node:crypto";
import { PARKS } from "@/data/parks";

type GateSession = { parkId?: string };

function sessionConfig() {
  return {
    password: process.env["SESSION_SECRET"]!,
    name: "deep-park-gate",
    maxAge: 60 * 60 * 24 * 180,
    cookie: { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" },
  };
}

function matches(input: string, expected: string): boolean {
  const a = createHash("sha256").update(input, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(a, b);
}

export const getParkSession = createServerFn({ method: "GET" }).handler(async () => {
  const session = await useSession<GateSession>(sessionConfig());
  const parkId = session.data.parkId;
  if (!parkId || !PARKS.some((park) => park.id === parkId)) return { parkId: null };
  return { parkId };
});

export const unlockPark = createServerFn({ method: "POST" })
  .inputValidator((data: { parkId: string; password: string }) => data)
  .handler(async ({ data }) => {
    const park = PARKS.find((item) => item.id === data.parkId);
    if (!park) return { ok: false as const };

    const envName = `PARK_PASSWORD_${park.id.toUpperCase()}`;
    const expected = process.env[envName];
    if (!expected) return { ok: false as const };
    if (!matches(data.password, expected)) return { ok: false as const };

    const session = await useSession<GateSession>(sessionConfig());
    await session.update({ parkId: park.id });
    return { ok: true as const };
  });

export const lockPark = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useSession<GateSession>(sessionConfig());
  await session.clear();
  return { ok: true as const };
});
