import Str from "../backend/Helpers/Str"

describe('test Str helper', ()=>{
    test('getTableAlias return alias', ()=>{
        expect(Str.getTableAlias("conversations_users")).toBe("cu")
    })
})