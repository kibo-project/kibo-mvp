export class BaseApiService {
  protected baseUrl: string;

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_URL || "/api") {
    this.baseUrl = baseUrl;
  }

  protected async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultHeaders: Record<string, string> = {};
    if (!(options.body instanceof FormData)) {
      defaultHeaders["Content-Type"] = "application/json";
    }

    let response = await fetch(url, {
      credentials: "include",
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      ...options,
    });

    if (response.status === 401) {
      try {
        const errorData = await response.json();

        if (errorData?.error?.code === "TOKEN_EXPIRED") {
          const refreshResponse = await fetch(`${this.baseUrl}/auth/refresh`, {
            method: "POST",
            credentials: "include",
          });

          if (refreshResponse.ok) {
            response = await fetch(url, {
              credentials: "include",
              headers: {
                ...defaultHeaders,
                ...options.headers,
              },
              ...options,
            });
          } else {
            if (typeof window !== "undefined") {
              window.location.href = "/login";
            }
            throw new Error("Session expired");
          }
        }
      } catch (parseError) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.log("API Error response:", errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    return response.json();
  }
}
