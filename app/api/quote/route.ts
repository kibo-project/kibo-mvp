import { NextRequest } from "next/server";
import { QuoteController } from "@/core/controllers/quote.controller";

const controller = new QuoteController();

export async function GET(request: NextRequest) {
  return controller.getQuote(request);
}
