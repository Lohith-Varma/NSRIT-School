/** Simulates network latency for mock API calls */
export async function mockRequest<T>(data: T, delayMs = 400): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, delayMs));
  return data;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
