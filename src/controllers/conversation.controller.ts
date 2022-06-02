import { Request, Response } from 'express';

import Conversation from '../models/Conversation';

export async function getCurrentUserConversations(req: Request, res: Response) {
  try {
    const conversations = await Conversation.find({
      members: {
        $all: [req.userId]
      }
    }).populate('members');

    return res.status(200).send(conversations);
  } catch {
    return res.status(500).send({ message: 'Error' });
  }
}
