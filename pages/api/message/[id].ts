import MessageTable from "@/backend/database/tables/MessageTable";
import type { NextApiRequest, NextApiResponse } from "next";
import type { NextRequest } from "next/server";

export default async function Message(req: NextRequest | NextApiRequest, res:NextApiResponse){
    const request = req as NextApiRequest;
    const { id } = request.query;
    const int_message_id = parseInt(id as string);

    try {
      const messageTable = new MessageTable()
      await messageTable.delete(int_message_id)

      res.status(200).json({ success: true });
    } catch (e) {
      res.status(500).json({ success: false, error: e });
    }
}