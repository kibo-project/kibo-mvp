/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";
import { QuoteService } from "../services/qoute.service";
import { ApiErrorResponse, ApiResponse } from "../types/generic.types";
import { QuoteRequest } from "../types/quote.types";
import { CryptoToken, Currency, Network } from "@/core/types/orders.types";

export class QuoteController {
  private quoteService: QuoteService;

  constructor() {
    this.quoteService = new QuoteService();
  }

  async getQuote(request: NextRequest): Promise<Response> {
    try {
      const { searchParams } = new URL(request.url);
      const fiatAmountParam = searchParams.get("fiatAmount");
      const fiatCurrencyParam = searchParams.get("fiatCurrency");
      const cryptoCurrencyParam = searchParams.get("cryptoCurrency");
      const networkParam = searchParams.get("network");

      if (!fiatAmountParam || !fiatCurrencyParam || !cryptoCurrencyParam || !networkParam) {
        return Response.json(
          {
            success: false,
            error: {
              code: "MISSING_FIELDS",
              message: "fiatAmount, fiatCurrency, cryptoCurrency, and network are required",
            },
          },
          { status: 400 }
        );
      }

      const quoteRequest: QuoteRequest = {
        fiatAmount: parseFloat(fiatAmountParam),
        fiatCurrency: fiatCurrencyParam as Currency,
        cryptoCurrency: cryptoCurrencyParam as CryptoToken,
        network: networkParam as Network,
      };

      const result = await this.quoteService.getQuote(quoteRequest);
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
      };
      return Response.json(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  private handleError(error: unknown): Response {
    console.error("Quote Controller Error:", error);

    let code = "INTERNAL_ERROR";
    let message = "An unexpected error occurred";
    let details: unknown;

    if (error instanceof Error) {
      message = error.message;
      details = process.env.NODE_ENV === "development" ? error.stack : undefined;
      code = (error as any).code || "INTERNAL_ERROR";
    }

    const statusCode = this.getStatusCodeFromError(error);

    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code,
        message,
        details,
      },
    };

    return Response.json(errorResponse, { status: statusCode });
  }

  private getStatusCodeFromError(error: unknown): number {
    if (error instanceof Error) {
      if (error.message.includes("not found")) return 404;
      if (error.message.includes("Authentication required")) return 401;
      if (error.message.includes("Access denied")) return 403;
      if (error.message.includes("Invalid") || error.message.includes("required")) return 400;
    }
    return 500;
  }
}
