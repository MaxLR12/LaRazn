import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: pollId } = await params;

  const poll = await prisma.poll.findUnique({
    where: { id: pollId },
    include: { options: { orderBy: { position: "asc" } } },
  });
  if (!poll) {
    return NextResponse.json({ error: "Encuesta no encontrada" }, { status: 404 });
  }

  const cookieStore = await cookies();
  const voterId = cookieStore.get("voter_id")?.value ?? "";

  const voted = voterId
    ? await prisma.vote.findUnique({
        where: { pollId_voterId: { pollId, voterId } },
      })
    : null;

  const options = await prisma.option.findMany({
    where: { pollId },
    orderBy: { position: "asc" },
    include: { _count: { select: { votes: true } } },
  });
  const total = options.reduce((sum: number, o) => sum + o._count.votes, 0);
  const results = options.map((o) => ({
    id: o.id,
    text: o.text,
    imageUrl: o.imageUrl,
    votes: o._count.votes,
    percent: total > 0 ? Math.round((o._count.votes / total) * 100) : 0,
  }));

  return NextResponse.json({
    poll: { id: poll.id, title: poll.title, question: poll.question, imageUrl: poll.imageUrl, imageSize: poll.imageSize },
    results,
    total,
    hasVoted: !!voted,
    votedOptionId: voted?.optionId ?? null,
  });
}
