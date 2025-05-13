import BlockedUsersTable from "../../../backend/database/tables/BlockedUsers";
import {NextApiRequest, NextApiResponse} from "next"
import { User } from "../../../types/user";
import { BlockedUsers, ColumnsToFill } from "../../../types/Database";
import { getSession } from "@/lib";


export default async function Block(req: NextApiRequest, res: NextApiResponse) {
    const session = await getSession(req, res);
    const user = session.user as User;
    const blockedUsersTable = new BlockedUsersTable()

    const { adressee_id } = req.body as { adressee_id: number };
    if (adressee_id && typeof adressee_id === "number") {
      try {
        const [blocked_user] = (await blockedUsersTable
          .columns<User, undefined>(["bu.*"])
          .join({
            user: {
              alias: "u",
              on: "u.id = bu.user_id AND u.id = bu.blocked_user_id",
              type: "LEFT",
            },
          })
          .where<User>(
            ["bu.blocked_user_id", "bu.user_id"],
            [adressee_id, user.id]
          )
          .get()) as BlockedUsers[];

        if (blocked_user) {
          await blockedUsersTable.delete(
            ["blocked_user_id", "user_id"],
            [adressee_id, user.id]
          );

          res.status(200).json({ success: true });
        } else {
          await blockedUsersTable.new({
            user_id: user.id,
            blocked_user_id: adressee_id,
          } as ColumnsToFill<BlockedUsers>);

          res.status(200).json({ success: true });
        }
      } catch (e) {
        res.status(500).json({ success: false, error: e });
      }
    } else {
      res
        .status(404)
        .json({ success: false, message: "Not found" });
    }
}