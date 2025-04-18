import { Request, Response } from 'express';

export interface ITransport {
  readonly sessionId: string;
  start(): Promise<void>;
  close(): Promise<void>;
  handlePostMessage(req: Request, res: Response, body: any): Promise<void>;
  onclose?: () => void;
}
