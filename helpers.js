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

    //TODO: simplify, this is way too complex, very repetitive
    linkList: (type, lst, grey = false) => {
        //handle simple arrays (for genres where name and id are the same)
        //i.e. ["Rock", "Classic Rock"]
        if(lst.length > 0 && typeof lst[0] !== "object") {
            return lst.map((name) => {
                const url = encodeURI(`/${type}/${name}`)
                if(grey)
                    return `<a class="greyed-text" href="${url}">${name}</a>`
                return `<a href="${url}">${name}</a>`
            })
        }
        //handle an object-arry like [{id: foo, name: bar}]
        return lst.map((pair) => {
            pair.name = pair.name || pair.title //it's always a name or title, never both
            const url = encodeURI(`/${type}/${pair._id}`) //TODO: see about extracting this, similar functionality to link
            if(grey)
                return `<a class="greyed-text" href="${url}">${pair.name}</a>`
            return `<a href="${url}">${pair.name}</a>`
        })
    },

    timeFrame: (id, lst) => {
        let yearStart, yearEnd;
        for(let history of lst) {
            if(history.band.toString() == id.toString()) { //they're technically objects (Object ID)
                yearStart = history.yearStart
                yearEnd = history.yearEnd
                break
            }
        }

        if(yearStart && yearEnd)
            return `(${yearStart} - ${yearEnd})`
        if(yearStart && !yearEnd)
            return `(${yearStart} - Present)`
        if(!yearStart && yearEnd)
            return `(Until ${yearEnd})`
    }
}