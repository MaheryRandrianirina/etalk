function debounce(cb: Function){
    let timer: NodeJS.Timeout|null = null
    
    return (...args: any[]) => {
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => cb(...args), 1000)
    }
}

export { debounce }