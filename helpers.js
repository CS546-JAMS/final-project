module.exports = {

    link: (type, id, text) => {
        const url = encodeURI(`/${type}/${id}`)
        return `<a href="${url}">${text}</a>`
    },
    
    commaString: (lst) => {
        return lst.join(', ')
    },

    descriptor: (lst, name) => {
        if(lst.length === 1)
            return `${lst.length} ${name}`
        return `${lst.length} ${name}s`
    },

    timeInMinutes: (seconds) => {
        return `${Math.floor(seconds / 60)}:${seconds % 60}`
    },

    commatize: (num) => {
        return num.toLocaleString()
    },

    linkList: (type, params, grey = false) => {
        return params.map((pair) => {
            const url = encodeURI(`/${type}/${pair._id}`) //TODO: see about extracting this, similar functionality to link
            if(grey)
                return `<a class="greyed-text" href="${url}">${pair.name}</a>`
            return `<a href="${url}">${pair.name}</a>`
        })
    }
}