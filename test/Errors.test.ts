import { FileError, UploadError} from "@/lib/index"

describe("Custom Error test", () => {
    test("FileError message is string", () => {
        const error = new FileError('Ce message est une chaine de caractère')
        expect(typeof error.message === "string").toBeTruthy()
    })

    test("UploadError message is string", () => {
        const error = new UploadError('Ce message est une chaine de caractère')
        expect(typeof error.message === "string").toBeTruthy()
    })
})