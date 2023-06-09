import Str from "../backend/Helpers/Str"

describe('test Str helper', ()=>{
    test('getTableAlias return alias', ()=>{
        expect(Str.getTableAlias("conversation_user")).toBe("cu")
    })
})