import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = auth();

    //do not have user id
    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    const { name, value } = await req.json();

    //do not have label and image URL

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!value) {
      return new NextResponse("Value URL is required", { status: 400 });
    }

    if (!params.storeId) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    //store not found
    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    // Create a color
    const color = await prismadb.color.create({
      data: {
        name,
        value,
        storeId: params.storeId,
      },
    });

    return NextResponse.json(color);
  } catch (error) {
    console.error("[COLORS_POST] : ", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    if (!params.storeId) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    const colors = await prismadb.color.findMany({
      where: {
        storeId: params.storeId,
      },
    });

    return NextResponse.json(colors);
  } catch (error) {
    console.error("[COLORS_GET] : ", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
