const BASE_URL = import.meta.env.VITE_API_URL

export namespace BrandApi {
  export interface BrandOut {
    name: string
    slug: string
    image: string
  }

  export const getAll = async (): Promise<BrandOut[]> => {
    const response = await fetch(`${BASE_URL}/brands`)
    const data = await response.json()
    return data
  }
}
