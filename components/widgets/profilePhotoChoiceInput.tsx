import { MouseEventHandler, useEffect } from "react"

export default function ProfilePhotoChoiceInput({onClickImagePicker, image}:{
    onClickImagePicker: MouseEventHandler<HTMLDivElement> | null,
    image: File | null
}): JSX.Element {
    const imageSize = [100, 100]
    useEffect(()=>{
        if(image !== null){
            drawImageInsideCanvas(image)
        }
    })

    const drawImageInsideCanvas: (img: File)=>void = (img)=>{
        const canvas = document.getElementById("selected_image_canvas") as HTMLCanvasElement
        if(canvas){
            canvas.width = imageSize[0]
            canvas.height = imageSize[1]

            const ctx = canvas.getContext("2d")
            createImageBitmap(img).then(i => {
                ctx?.drawImage(i, 0, 0, imageSize[0], imageSize[1])
                
            })
        }else {
            console.error("La variable canvas contient une valeur null")
        }
    }

    return <div className="profile_photo_choice" onClick={onClickImagePicker !== null ? onClickImagePicker : undefined}>
        <input className="hidden_file_input" type="file" style={{display: "none"}} accept="image/*"/>
        <svg className={"camera_icon" + (image !== null ? " shrunk" : "")} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
            <circle cx="12" cy="13" r="4"></circle>
        </svg>
        {image !== null && <canvas id="selected_image_canvas"></canvas>}
    </div>
}