import Query from "../backend/database/Query"
import { Conversation } from "../types/Database"
import { User } from "../types/user"

describe('test querybuilder', ()=>{
    test("insert query success", ()=>{
        let query: Query<User> = new Query<User>('user')
        const simpleInsert = query.insert(['name', "username"]).__toString()
    
        expect(simpleInsert).toBe("INSERT INTO user SET name = ?, username = ?")

        query = new Query<User>("user")
        const insertWithConditions = query.insert(['name', 'username'])
            .where({"id": 2}).__toString()
        expect(insertWithConditions)
            .toBe('INSERT INTO user SET name = ?, username = ? WHERE id = 2')
    })

    test('update query success', ()=>{
        let query: Query<User> = new Query<User>('user')
        const update = query.update(['username'])
        expect(update).toBeInstanceOf(Query<User>)
        expect(update.__toString()).toBe("UPDATE user SET username = ?")

        query = new Query('user')
        expect(query.update(['username']).where({"id": 2}).__toString())
            .toBe('UPDATE user SET username = ? WHERE id = 2')
    })

    test('simple select query', ()=>{
        let query: Query<User> = new Query<User>('user')
        expect(query.select("*").__toString()).toBe("SELECT * FROM user")
    })

    test('select query with conditions', ()=>{
        let query: Query<User> = new Query<User>('user')
        expect(query.select('*').where(["username", "name"]).__toString())
            .toBe('SELECT * FROM user WHERE username = ? AND name = ?')

        query = new Query<User>('user')
        expect(query.select(['username', "name"])
            .where({"username": "Mahery"})
            .__toString())
            .toBe("SELECT username, name FROM user WHERE username = Mahery")
    })

    test('select query with jointures', ()=>{
        let query: Query<User> = new Query<User>('user')
        expect(query.select('*', true).join({"conversation": {alias: "c", on: "c.user_id = u.id"}}).__toString())
            .toBe('SELECT * FROM user u JOIN conversation c ON c.user_id = u.id')
    })

    test('select query with jointures and conditions', ()=>{
        let query: Query<User> = new Query<User>('user')
        expect(query.select('*', true)
        .join({"conversation": {alias: "c", on: "c.user_id = u.id"}})
            .where<Conversation>({"c.id": 2})
            .__toString())
            .toBe('SELECT * FROM user u JOIN conversation c ON c.user_id = u.id WHERE c.id = 2')
    })

    test('select query with conditions LIKE', ()=>{
        let query: Query<User> = new Query<User>('user')
        expect(query.select('*')
            .where({"username": "% mah %"}, undefined, true)
            .__toString())
            .toBe('SELECT * FROM user WHERE username LIKE % mah %')
    })

    test("select with order", ()=>{
        let query: Query<User> = new Query<User>('user')
        expect(query.select('*')
            .orderBy("created_at DESC")
            .__toString())
            .toBe('SELECT * FROM user ORDER BY created_at DESC')
    })

    test("select with limit", ()=>{
        let query: Query<User> = new Query<User>('user')
        expect(query.select('*')
            .limit(2)
            .__toString())
            .toBe('SELECT * FROM user LIMIT 2')
    })

    test("select with conditions, order, limit", ()=>{
        let query: Query<User> = new Query<User>('user')
        expect(query.select('*')
            .where(['created_at', "email"])
            .orderBy("created_at DESC")
            .limit(2)
            .__toString())
            .toBe('SELECT * FROM user WHERE created_at = ? AND email = ? ORDER BY created_at DESC LIMIT 2')
    })

    test("delete query", ()=>{
        let query: Query<User> = new Query<User>('user')
        expect(query.delete().__toString())
            .toBe('DELETE FROM user')
    })
})
