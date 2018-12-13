module.exports = {

    link: (type, id, text, greyed) => {
        const url = encodeURI(`/${type}/${id}`)
        if(greyed)
            return `<a class="greyed-text" href="${url}">${text}</a>`
        return `<a href="${url}">${text}</a>`
    },

    lowercase: (str) => {
        return str.toLowerCase();
    },

    //crush something like [{"title": "albumTitle"}, {"title": "otherTitle"}] into ["albumTitle", "otherTitle"]
    crush: (objArr, field) => {
        return objArr.map(obj => {return obj[field]});
    },
    
    commaString: (lst) => {
        return lst.join(', ')
    },

    length: (lst) => {
        return lst.length
    },

    pluralize: (num, name) => {
        if(num === 1)
            return `${name}`
        return `${name}s`
    },

    timeInMinutes: (seconds) => {
        return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`
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