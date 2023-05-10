import { test } from "@jest/globals"
import Query from "../backend/database/Query"

test("insertion with conditions", ()=>{
    const queryBuilder = new Query("user")
    const query: string = queryBuilder.insert(["name, username"]).__toString()

    expect(query).toBe("INSERT INTO user SET name = ?, username = ?")
})
