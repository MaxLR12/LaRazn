import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: pollId } = await params;
  const { optionId } = await req.json();

  if (!optionId) {
    return NextResponse.json({ error: "Falta optionId" }, { status: 400 });
  }

  const cookieStore = await cookies();
  let voterId = cookieStore.get("voter_id")?.value;
  if (!voterId) {
    voterId = randomUUID();
  }

  const poll = await prisma.poll.findUnique({ where: { id: pollId } });
  if (!poll) {
    return NextResponse.json({ error: "Encuesta no encontrada" }, { status: 404 });
  }

  const option = await prisma.option.findFirst({
    where: { id: optionId, pollId },
  });
  if (!option) {
    return NextResponse.json({ error: "Opción no válida" }, { status: 400 });
  }

  const existing = await prisma.vote.findUnique({
    where: { pollId_voterId: { pollId, voterId } },
  });
  if (existing) {
    return NextResponse.json({ error: "Ya has votado en esta encuesta", alreadyVoted: true }, { status: 409 });
  }

  await prisma.vote.create({ data: { pollId, optionId, voterId } });

  const results = await getResults(pollId);

  const response = NextResponse.json({ success: true, results });
  response.cookies.set("voter_id", voterId, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "none",
    secure: true,
    path: "/",
  });
  return response;
}

async function getResults(pollId: string) {
  const options = await prisma.option.findMany({
    where: { pollId },
    orderBy: { position: "asc" },
    include: { _count: { select: { votes: true } } },
  });
  const total = options.reduce((sum: number, o) => sum + o._count.votes, 0);
  return options.map((o) => ({
    id: o.id,
    text: o.text,
    imageUrl: o.imageUrl,
    votes: o._count.votes,
    percent: total > 0 ? Math.round((o._count.votes / total) * 100) : 0,
  }));
}
