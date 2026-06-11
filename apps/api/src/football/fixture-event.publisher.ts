import { Injectable, Logger } from '@nestjs/common';

export interface IFixtureEventPublisher {
  publishFixtureStatusChanged(fixtureId: string, status: string): void;
  publishFixtureScoreChanged(fixtureId: string, homeScore: number, awayScore: number): void;
  publishMatchEventCreated(fixtureId: string, eventType: string, minute: number): void;
}

@Injectable()
export class FixtureEventPublisher implements IFixtureEventPublisher {
  private readonly logger = new Logger(FixtureEventPublisher.name);

  publishFixtureStatusChanged(fixtureId: string, status: string): void {
    this.logger.log(`[fixture.status_changed] fixtureId=${fixtureId} status=${status}`);
  }

  publishFixtureScoreChanged(fixtureId: string, homeScore: number, awayScore: number): void {
    this.logger.log(`[fixture.score_changed] fixtureId=${fixtureId} score=${homeScore}-${awayScore}`);
  }

  publishMatchEventCreated(fixtureId: string, eventType: string, minute: number): void {
    this.logger.log(`[match_event.created] fixtureId=${fixtureId} type=${eventType} minute=${minute}`);
  }
}
