function debounce(cb: Function, delay: number = 1000) {
    let timer: NodeJS.Timeout|null = null
    
    return (...args: any[]) => {
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => cb(...args), delay)
    }
}

export { debounce }