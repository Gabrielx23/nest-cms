import { ApiProperty } from '@nestjs/swagger';

export class PaginationResponseDTO {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 2 })
  count: number;

  @ApiProperty({ example: 5 })
  totalCount: number;

  @ApiProperty({ example: [] })
  rows: Array<any>;
}
