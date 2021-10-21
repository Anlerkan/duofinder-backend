export abstract class BaseEvent<TRest = unknown> {
  abstract serializeRest(): TRest;

  abstract getStatusCode(): number;
}
