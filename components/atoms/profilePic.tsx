import Image, { StaticImageData } from "next/image"

export default function ProfilePic({imagePath}: {imagePath: string | StaticImageData}): JSX.Element {
    const profilePic = (()=>{
        if(typeof imagePath === "string"){
            return `/images/user/profile_photo/${imagePath}`
        }
        
        return imagePath
    })()
    // fix : image height & width in the adressee profile
    return <Image src={profilePic} alt="user profile photo" className="profile_pic" width={250} height={250}/>
}