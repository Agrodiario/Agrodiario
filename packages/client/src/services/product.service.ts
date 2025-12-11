import {
  CreateProductDto,
  Product,
  ProductFormData,
} from "../types/product.types.ts";
import { apiClient } from "../config/api.client.ts";

class ProductService {
  async create(data: CreateProductDto): Promise<ProductFormData> {
    const response = await apiClient.post<Product>("/products", data);
    return response.data;
  }

  async searchProductsByName(query: string): Promise<ProductFormData[]> {
    if (!query || query.trim() === "") return [];

    const response = await apiClient.get<Product[]>(
      "/products/search/commercial-name",
      {
        params: { q: query },
      },
    );
    return response.data;
  }
}

export const productService = new ProductService();
