import { ApiProperty } from '@nestjs/swagger';

export class HealthDto {
  @ApiProperty({ example: true, description: 'Mọi thứ bên dưới đều sống' })
  ok!: boolean;

  @ApiProperty({ example: true })
  db!: boolean;

  @ApiProperty({ example: true })
  redis!: boolean;

  @ApiProperty({ example: 1234 })
  uptimeSeconds!: number;
}
