import { Request, Response } from 'express';

import Conversation from '../models/Conversation';
import Message from '../models/Message';

export async function sendMessage(req: Request, res: Response) {
  const { content } = req.body;
  const { receiverId } = req.params;

  let conversation;

  const existingConversation = await Conversation.findOne({
    members: {
      $all: [req.userId, receiverId]
    }
  });

  if (existingConversation) {
    conversation = existingConversation;
  } else {
    const newConversation = await Conversation.create({
      members: [req.userId, receiverId]
    });

    conversation = newConversation;
  }

  const message = await Message.create({
    conversationId: conversation._id,
    createdBy: req.userId,
    content
  });

  return res.status(201).send(message);
}
