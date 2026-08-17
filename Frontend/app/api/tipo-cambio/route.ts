import { NextResponse } from "next/server";
import { getExchangeRate } from "@/lib/exchangeRate";

export async function GET() {
  const rate = await getExchangeRate();
  return NextResponse.json(rate);
}
