import { HydratedDocument } from 'mongoose';
import { SneakerRepository } from '../repositories/sql/SneakerRepository';
import { ISneaker } from '../models/mongodb/Sneaker';
import {
  FilterOptions,
  PaginatedResponse,
  SortOptions,
} from '../helpers/interfaces';
import {
  FlattenedSneakerVariant,
  SneakerRepository as SneakerRepositoryMongo,
} from '../repositories/mongodb/SneakerRepository';
import { Sneaker, SneakerDTO } from '../models/sql/Sneaker';
import { RequestError } from '../helpers/error';
import { StatusCodes } from 'http-status-codes';

export class SneakerService {
  public static async getPaginated(
    q: string,
    page: number,
    limit: number,
    sortOptions: SortOptions,
    filterOptions: FilterOptions,
  ): Promise<PaginatedResponse<HydratedDocument<ISneaker>>> {
    let allFilterOptions: Record<string, unknown> = {};
    // S'il s'agit d'une recherche (barre de recherche), on cherche une correspondance large selon les champs suivants
    // Exemple : si l'utilisateur tape "nike", on veut que la recherche retourne tous les sneakers dont l'un des champs suivants contient "nike"
    if (q) {
      allFilterOptions['$or'] = [
        { name: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
        { brand: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { 'variants.color': { $regex: q, $options: 'i' } },
        { 'variants.size': { $regex: q, $options: 'i' } },
      ];
    }
    allFilterOptions = { ...allFilterOptions, ...filterOptions };

    const sneakers = await SneakerRepositoryMongo.getPaginated(
      page,
      limit,
      sortOptions,
      allFilterOptions,
    );

    // Pour en déduire le nombre total de pages à afficher sur la web app
    // https://www.reddit.com/r/csharp/comments/uepldu/how_to_get_total_count_of_records_and_pagination/
    const totalCount = await SneakerRepositoryMongo.getTotalCount(
      sortOptions,
      allFilterOptions,
    );

    return {
      total: totalCount,
      page,
      limit,
      items: sneakers,
    };
  }

  public static async getVariantsPaginated(
    q: string,
    page: number,
    limit: number,
    sortOptions: SortOptions,
    filterOptions: FilterOptions,
  ): Promise<PaginatedResponse<FlattenedSneakerVariant>> {
    let allFilterOptions: Record<string, unknown> = {};
    if (q) {
      allFilterOptions['$or'] = [
        { name: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
        { brand: { $regex: q, $options: 'i' } },
        { 'variants.color': { $regex: q, $options: 'i' } },
        { 'variants.size': { $regex: q, $options: 'i' } },
      ];
    }
    allFilterOptions = { ...allFilterOptions, ...filterOptions };

    const variants = await SneakerRepositoryMongo.getVariantsPaginated(
      page,
      limit,
      sortOptions,
      allFilterOptions,
    );

    // Pour en déduire le nombre total de pages à afficher sur la web app
    // https://www.reddit.com/r/csharp/comments/uepldu/how_to_get_total_count_of_records_and_pagination/
    const totalCount =
      await SneakerRepositoryMongo.getVariantsTotalCount(allFilterOptions);

    return {
      total: totalCount,
      page,
      limit,
      items: variants,
    };
  }

  public static async find(
    filterOptions: FilterOptions,
  ): Promise<HydratedDocument<ISneaker> | null> {
    const sneaker = await SneakerRepositoryMongo.findOne(filterOptions);
    if (!sneaker) {
      throw new RequestError(StatusCodes.NOT_FOUND);
    }
    return sneaker;
  }

  public static async findOneBySlug(
    slug: string,
  ): Promise<HydratedDocument<ISneaker> | null> {
    return await SneakerRepositoryMongo.findOneBySlug(slug);
  }

  public static async delete(id: number): Promise<number> {
    return await SneakerRepository.delete(id);
  }

  public static async create(sneaker: SneakerDTO): Promise<Sneaker> {
    if (await this.isSneakerExists(sneaker)) {
      throw new RequestError(
        StatusCodes.UNPROCESSABLE_ENTITY,
        'Sneaker name already exists',
      );
    }

    return await SneakerRepository.create(sneaker);
  }

  static async createOrUpdate(
    id: number,
    name: string,
    description: string,
    price: number,
    categoryId: number,
    brandId: number,
  ): Promise<{ created: boolean; sneaker: Sneaker }> {
    const { created, sneaker } = await SneakerRepository.updateOrCreate(id, {
      name,
      description,
      price,
      categoryId,
      brandId,
    });
    return { created, sneaker };
  }

  public static async partialUpdate(
    id: number,
    sneaker: SneakerDTO,
  ): Promise<Sneaker | null> {
    const isSneakerExists = await SneakerRepository.partialUpdate(id, sneaker);

    if (!isSneakerExists) {
      throw new RequestError(StatusCodes.NOT_FOUND, 'Sneaker not found');
    }

    return isSneakerExists;
  }

  public static async isSneakerExists(sneaker: SneakerDTO): Promise<boolean> {
    const isSneakerAlreadyExists = await SneakerRepository.findSneakerByName(
      sneaker.name,
    );

    return !!isSneakerAlreadyExists;
  }
}
