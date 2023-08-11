
type DataFromRegistration = {
    name: string,
    firstname: string,
    username: string,
    sex: "man" | "woman",
    email: string,
    password: string,
    password_confirmation: string,
    image: string
}

export type { DataFromRegistration }