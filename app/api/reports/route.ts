import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function GET() {
  try {
    const sets = await prisma.experimentSet.findMany({
      orderBy: { timestamp: "desc" },
      take: 50,
      include: {
        responses: {
          select: {
            id: true,
            timestamp: true,
            temperature: true,
            topP: true,
            maxTokens: true,
          },
        },
      },
    });
    return NextResponse.json({ sets });
  } catch (err) {
    console.error("Error fetching reports", err);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}
