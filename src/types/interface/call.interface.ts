export interface ICall {
    user: any;
    provider: any;
    status: "scheduled" | "ongoing" | "completed" | "canceled";
    scheduledAt?: Date;
    startedAt?: Date;
    endedAt?: Date;
    duration: number;
    callCost: number;
  }
  