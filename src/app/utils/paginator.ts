import { PaginationOptionsInterface } from '../interfaces/pagination-options.interface';
import { PaginationDataInterface } from '../interfaces/pagination-data.interface';
import { PaginationResponseDTO } from '../dto/pagination-response.dto';

export class Paginator {
  public static paginate(
    options: PaginationOptionsInterface,
    data: PaginationDataInterface,
  ): PaginationResponseDTO {
    const dto = new PaginationResponseDTO();

    dto.limit = options.limit;
    dto.page = options.page;
    dto.count = data.count;
    dto.totalCount = data.totalCount;
    dto.rows = data.rows;

    return dto;
  }
}
