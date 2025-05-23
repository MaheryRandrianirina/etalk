import {Conversation} from "@/backend/User/Conversation";
import {NextApiRequest, NextApiResponse} from "next"
import { Message as MessageType} from "@/types/Database";
import { getSession } from "@/lib";
import { NextRequest } from "next/server";


export default async function Message(req: NextRequest | NextApiRequest, res:NextApiResponse){
    const session = await getSession(req as NextApiRequest, res);
    const request = req as NextApiRequest;
    const { receiver_id } = request.query;
    const int_receiver_id = parseInt(receiver_id as string);
    const message = req.body as MessageType;

    try {
      const conversation = new Conversation(req as NextApiRequest, session);
      await conversation.new(int_receiver_id, message);

      res.status(200).json({ success: true });
    } catch (e) {
      res.status(500).json({ success: false, error: e });
    }
}