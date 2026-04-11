import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { TurnsService } from './turns.service';
import { RegisterTurnDto, UpdateTurnDto } from './dto/create_turn.dto';

@Controller('turns')
export class TurnsController {
  constructor(private readonly turnsService: TurnsService) {}

  @Post()
  async createTurn(@Body() body: RegisterTurnDto) {
    return this.turnsService.createNewTurn(body);
  }

  @Get('/branch/:branchId')
  async getTurnsByBranch(@Param('branchId') branchId: string) {
    return this.turnsService.getTurnsByBranch(branchId);
  }

  @Patch('/:turnId')
  async updateTurn(
    @Param('turnId') turnId: number,
    @Body() body: UpdateTurnDto,
  ) {
    return this.turnsService.updateTurn(turnId, body);
  }

  @Delete('/:turnId')
  async deleteTurn(@Param('turnId') turnId: number) {
    return this.turnsService.deleteTurn(turnId);
  }
}
