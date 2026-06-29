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
    this.logger.log({ action: 'fixture.status_changed', fixtureId, status });
  }

  publishFixtureScoreChanged(fixtureId: string, homeScore: number, awayScore: number): void {
    this.logger.log({ action: 'fixture.score_changed', fixtureId, homeScore, awayScore });
  }

  publishMatchEventCreated(fixtureId: string, eventType: string, minute: number): void {
    this.logger.log({ action: 'match_event.created', fixtureId, eventType, minute });
  }
}
