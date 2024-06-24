import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = auth();

    //do not have user id
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { name } = await req.json();

    //do not have name

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    // Create a store
    const store = await prismadb.store.create({
      data: {
        name,
        userId,
      },
    });

    return NextResponse.json(store);

  } catch (error) {
    console.error("[STORES_POST] : ", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
