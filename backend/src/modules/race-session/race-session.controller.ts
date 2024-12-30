import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { RaceSessionService } from './race-session.service';
import { RaceSession } from '../../models/race-session.model';
import { RaceDriver } from '../../models/race-driver.model';
import { TimerService } from '../../timer/timer.service';

@Controller('race-sessions')
export class RaceSessionController {

    constructor(
        private readonly raceSessionService: RaceSessionService,
        private readonly timerService: TimerService,
    ) {}

    @Get()
    findAll() {
        return this.raceSessionService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: number) {
        return this.raceSessionService.findOne(id);
    }


    @Post()
    create(@Body() raceSession: RaceSession) {
        return this.raceSessionService.create(raceSession);
    }

    @Put(':id')
    async update(@Param('id') id: number, @Body() raceSession: RaceSession) {
        return await this.raceSessionService.update(id, raceSession);
    }

    @Delete(':id')
    remove(@Param('id') id: number) {
        return this.raceSessionService.remove(id);
    }
    @Post(':id/drivers')
    async addDriver(
        @Param('id') sessionId: number,
        @Body() driverData: { name: string; carNumber: number },
    ) {
        return this.raceSessionService.addDriverToSession(sessionId, driverData);
    }
    @Get(':id/drivers')
    async getDrivers(@Param('id') sessionId: number) {
        return this.raceSessionService.getDriversForSession(sessionId);
    }
    @Put(':id/status')
    async updateStatus(@Param('id') id: number, @Body() updateData: { status: string }) {
        return await this.raceSessionService.updateStatus(id, updateData.status);
    }
    // Updated method for starting the timer
  @Put(':id/start-timer')
  startTimerForRace(@Param('id') id: number) {
    this.timerService.startTimer(); // Timer duration is read from environment variable (TIMER_DURATION)
    return { message: `Timer started for race session ${id}` };
  }
    @Put(':id/flag')
    async updateFlag(
        @Param('id') sessionId: number,
        @Body() updateData: { flag: string },
    ) {
        return this.raceSessionService.updateFlag(sessionId, updateData.flag);
    }
    @Get('current-race')
    async getCurrentRace() {
        try {
            console.log('Getting current race...');
            const activeRace = await this.raceSessionService.findActiveRace();
            console.log('Active race found:', activeRace);

            // Всегда возвращаем объект с данными, независимо от результата
            const response = {
                success: true,
                data: activeRace ? {
                    sessionId: activeRace.id,
                    sessionName: activeRace.sessionName,
                    status: activeRace.status,
                    flag: activeRace.currentFlag || 'Safe'
                } : {
                    sessionId: "Unknown",
                    sessionName: "No data",
                    status: "No data",
                    flag: "Safe"
                }
            };

            console.log('Sending response:', response);
            return response; // Явно возвращаем ответ
        } catch (error) {
            console.error('Error in getCurrentRace:', error);
            // В случае ошибки тоже возвращаем структурированный ответ
            return {
                success: false,
                error: 'Failed to fetch current race',
                data: {
                    sessionId: "Unknown",
                    sessionName: "Error occurred",
                    status: "Error",
                    flag: "Safe"
                }
            };
        }
    }

}
