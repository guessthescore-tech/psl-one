import { IsUUID } from 'class-validator';

export class TransferDto {
  @IsUUID()
  removePlayerId!: string;

  @IsUUID()
  addPlayerId!: string;
}
