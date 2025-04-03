import Image, { StaticImageData } from "next/image"

export default function ProfilePic({imagePath}: {imagePath: string | StaticImageData}): JSX.Element {
    return <Image src={imagePath} alt="user profile photo" className="profile_pic"/>
}