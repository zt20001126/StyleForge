export type TextToFashionGenerateRequest = {
  model: string;
  prompt: string;
  count: number;
};

export type TextToFashionGenerateResponse = {
  taskId: string;
  status: "success" | "processing" | "failed";
  images: {
    id: string;
    url: string;
    prompt: string;
  }[];
};

const mockResultImages = [
  "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
];

export async function generateTextToFashion(
  payload: TextToFashionGenerateRequest,
): Promise<TextToFashionGenerateResponse> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const count = Math.min(4, Math.max(1, payload.count));

  return {
    taskId: `mock-text-fashion-${Date.now()}`,
    status: "success",
    images: Array.from({ length: count }, (_, index) => ({
      id: `mock-text-fashion-image-${index + 1}`,
      url: mockResultImages[index % mockResultImages.length],
      prompt: payload.prompt,
    })),
  };
}
