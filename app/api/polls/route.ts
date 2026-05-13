import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const polls = await prisma.poll.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      options: { orderBy: { position: "asc" } },
      _count: { select: { votes: true } },
    },
  });
  return NextResponse.json(polls);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, question, imageUrl, imageSize, options } = body as {
    title: string;
    question: string;
    imageUrl?: string;
    imageSize?: string;
    options: { text: string; imageUrl?: string }[];
  };

  if (!title?.trim() || !question?.trim() || !options?.length) {
    return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
  }
  if (options.length > 8) {
    return NextResponse.json({ error: "Máximo 8 opciones" }, { status: 400 });
  }

  const poll = await prisma.poll.create({
    data: {
      title: title.trim(),
      question: question.trim(),
      imageUrl: imageUrl?.trim() || null,
      imageSize: imageSize === "large" ? "large" : "small",
      options: {
        create: options.map((opt, i) => ({
          text: opt.text.trim(),
          imageUrl: opt.imageUrl?.trim() || null,
          position: i,
        })),
      },
    },
    include: { options: { orderBy: { position: "asc" } } },
  });

  return NextResponse.json(poll, { status: 201 });
}
