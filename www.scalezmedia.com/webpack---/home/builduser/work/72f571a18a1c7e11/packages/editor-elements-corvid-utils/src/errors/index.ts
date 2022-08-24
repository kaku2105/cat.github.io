import { messages } from '../messages';

export class NilAssignmentError extends Error {
  constructor(params: Parameters<typeof messages.nilAssignmentMessage>[0]) {
    const message = messages.nilAssignmentMessage(params);
    super(message);
    this.name = 'NilAssignmentError';
    this.message = message;
  }
}

export class UnsupportedLinkTypeError extends Error {
  constructor(params: Parameters<typeof messages.unsupportedLinkType>[0]) {
    const message = messages.unsupportedLinkType(params);
    super(message);
    this.name = 'UnsupportedLinkTypeError';
    this.message = message;
  }
}
