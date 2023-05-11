import Query from "../backend/database/Query"

describe('test querybuilder', ()=>{
    

    test("insert query success", ()=>{
        let query: Query = new Query('user')
        const simpleInsert = query.insert(['name', "username"]).__toString()
    
        expect(simpleInsert).toBe("INSERT INTO user SET name = ?, username = ?")

        query = new Query("user")
        const insertWithConditions = query.insert(['name', 'username']).where({"id": 2}).__toString()
        expect(insertWithConditions).toBe('INSERT INTO user SET name = ?, username = ? WHERE id = 2')
    })

    test('update query success', ()=>{
        let query: Query = new Query('user')
        const update = query.update(['username'])
        expect(update).toBeInstanceOf(Query)
        expect(update.__toString()).toBe("UPDATE user SET username = ?")

        query = new Query('user')
        expect(query.update(['username']).where({"id": 2}).__toString()).toBe('UPDATE user SET username = ? WHERE id = 2')
    })
})
